#!/usr/bin/env python3
"""What jsdom could not check: this page in a real browser engine.

RUN-REPORT.md section 7 lists "rendering in any real browser engine" as
unverified, and section 4's responsive row says "designed and coded, not
verified in a real browser. No headless Chrome in this container". That was
true when it was written. Chromium is present at /opt/pw-browsers, so it is
checkable now, and this is the check.

It deliberately does NOT re-do `npm run verify:payload`. That already renders
the real <Qualifier /> in jsdom and POSTs over real HTTP to the mock webhook,
which validates the contract strictly. Repeating it here would add runtime and
prove nothing new. What only a browser can answer:

  1. Layout at 360, 768 and 1280px. jsdom has no layout at all, so "no
     horizontal overflow" was an assertion about CSS nobody had ever measured.
     Run with --self-test to watch those checks fail on purpose.
  2. The 16px input rule that stops iOS zooming the page on focus - a computed
     style, so again not visible to jsdom.
  3. Which analytics calls actually fire, in order, as a person scrolls and
     submits. This settles decision P-6 with evidence instead of a code read.
  4. That the phone-lead attribution fix works end to end through a real
     History API navigation, not just through the module's unit test.

NOTHING LEAVES THE MACHINE. The build uses obviously fake ids, every request
to a Meta or PostHog host is aborted at the route level before it is sent, and
the lead endpoint is the local mock. The Meta pixel is read from
`window.fbq.queue` rather than from the wire: with fbevents.js blocked, the
loader stub keeps every call in that array, which is a complete and exact
record of what the page asked Meta to record.

  python3 scripts/verify-browser.py [--headed]

Needs Playwright for Python and a Chromium. In this container both are already
present (PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers). On a fresh machine:
`pip install playwright && playwright install chromium`. It is deliberately not
an npm script: it is a verification pass, not part of the build, and adding
Playwright to package.json would put a browser download in the way of every
`npm ci`.
"""
from __future__ import annotations

import argparse
import http.server
import json
import os
import shutil
import socket
import subprocess
import sys
import threading
import time
from functools import partial
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "dist-verify"

# Obviously not real. They exist only so the code paths that are inert without
# an id actually run.
FAKE_PIXEL_ID = "000000000000000"
FAKE_POSTHOG_KEY = "phc_verification_only_not_a_real_key"

# A phone, a tablet and a laptop. A page can be clean at 360 and still overflow
# at 768: a max-width that only bites below a breakpoint, a table or a pre that
# has room to spread, a grid that goes two-up and stops wrapping. One width
# measured is one width proved, so measure the three that matter.
VIEWPORTS = (
    (360, 800, "phone"),
    (768, 1024, "tablet"),
    (1280, 800, "laptop"),
)
LOCALES = (("/", "en"), ("/da", "da"), ("/lt", "lt"))

# The measurement, plus the widest offenders when it is positive: a number on
# its own says the page overflows, this says what to go and look at.
OVERFLOW_JS = """() => {
  const over = document.documentElement.scrollWidth - window.innerWidth;
  const culprits = [];
  if (over > 0) {
    const wide = [];
    for (const el of document.querySelectorAll('*')) {
      const r = el.getBoundingClientRect();
      const right = r.right + window.scrollX;
      if (r.width > 0 && right > window.innerWidth + 1) wide.push({ el, right, w: r.width });
    }
    wide.sort((a, b) => b.right - a.right);
    for (const c of wide.slice(0, 3)) {
      const cls = typeof c.el.className === 'string' && c.el.className
        ? '.' + c.el.className.trim().split(/\s+/).slice(0, 2).join('.') : '';
      culprits.push(c.el.tagName.toLowerCase() + (c.el.id ? '#' + c.el.id : '') + cls
        + ' right=' + Math.round(c.right) + 'px w=' + Math.round(c.w) + 'px');
    }
  }
  return { over, culprits };
}"""

# --self-test only. A check nobody has watched fail is a check nobody should
# believe, so this puts a 2000px block on the page and the overflow checks must
# go red. If they stay green the measurement is not measuring anything.
CANARY_JS = """() => {
  const d = document.createElement('div');
  d.id = 'overflow-canary';
  d.style.cssText = 'width:2000px;height:4px;background:red';
  document.body.appendChild(d);
}"""

failures: list[str] = []


def check(ok: bool, label: str, detail: str = "") -> bool:
    print("  %s  %s%s" % ("PASS" if ok else "FAIL", label,
                          "  (%s)" % detail if detail else ""))
    if not ok:
        failures.append(label)
    return ok


def free_port() -> int:
    with socket.socket() as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


class SPA(http.server.SimpleHTTPRequestHandler):
    """Serve the built site, falling back to index.html for /da and /lt."""

    def do_GET(self):                                      # noqa: N802
        path = self.translate_path(self.path)
        if not Path(path).exists():
            self.path = "/index.html"
        return super().do_GET()

    def log_message(self, *_args):                         # silence
        pass


def serve(directory: Path) -> tuple[str, http.server.HTTPServer]:
    port = free_port()
    httpd = http.server.HTTPServer(
        ("127.0.0.1", port), partial(SPA, directory=str(directory)))
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return "http://127.0.0.1:%d" % port, httpd


def build(lead_endpoint: str) -> None:
    env = dict(os.environ)
    env.update({
        "VITE_META_PIXEL_ID": FAKE_PIXEL_ID,
        "VITE_POSTHOG_KEY": FAKE_POSTHOG_KEY,
        "VITE_POSTHOG_HOST": "https://eu.i.posthog.com",
        "VITE_LEAD_WEBHOOK_URL": lead_endpoint,
        "VITE_BOOKING_URL": "https://cal.example.invalid/doviloop",
    })
    print("building with placeholder analytics ids into %s/"
          % OUT.relative_to(ROOT))
    proc = subprocess.run(["npm", "run", "build", "--", "--outDir",
                           str(OUT), "--emptyOutDir"],
                          cwd=ROOT, env=env, capture_output=True, text=True)
    if proc.returncode != 0:
        print(proc.stdout[-3000:])
        print(proc.stderr[-3000:])
        raise SystemExit("build failed")


def make_demo_video(into: Path) -> bool:
    """A one-second video at /demo.mp4, so the demo lane is real.

    `public/demo.mp4` is not in the repo - dropping it in is one of the setup
    steps in ops/NEW-PC-SETUP.md - and Demo.tsx HEADs it and keeps a
    placeholder when it is missing. Without a file there is no <video> element,
    so `video_play` and its ViewContent could not be observed at all. Rather
    than skip the check, synthesise a file: it exercises exactly the branch the
    real video will take.
    """
    try:
        import imageio_ffmpeg
        exe = imageio_ffmpeg.get_ffmpeg_exe()
    except Exception:                                          # noqa: BLE001
        return False
    common = ["-hide_banner", "-loglevel", "error", "-y",
              "-f", "lavfi", "-i", "color=c=0x1c1c1c:s=640x360:d=1", "-r", "25"]
    made = subprocess.run(
        [exe, *common, "-c:v", "libx264", "-pix_fmt", "yuv420p",
         str(into / "demo.mp4")], capture_output=True)
    subprocess.run([exe, *common, "-frames:v", "1", str(into / "demo-poster.jpg")],
                   capture_output=True)
    return made.returncode == 0 and (into / "demo.mp4").exists()


def fbq_calls(page) -> list:
    """Every pixel call the page made, in order, with its arguments."""
    return page.evaluate(
        "() => (window.fbq && window.fbq.queue ? "
        "window.fbq.queue.map(a => Array.from(a)) : [])")


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description="Real-browser verification pass.")
    ap.add_argument("--headed", action="store_true")
    ap.add_argument("--keep", action="store_true",
                    help="leave dist-verify/ in place afterwards")
    ap.add_argument("--self-test", action="store_true",
                    help="inject a deliberately over-wide element so the "
                         "overflow checks must fail; proves they can go red")
    args = ap.parse_args(argv)

    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print("playwright for python is not installed; nothing was verified.\n"
              "  pip install playwright && playwright install chromium")
        return 2

    mock_port = free_port()
    mock_log = OUT.parent / ".verify-received.ndjson"
    mock_log.unlink(missing_ok=True)
    mock = subprocess.Popen(
        ["node", str(ROOT / "scripts" / "mock-webhook.mjs")],
        cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT,
        env={**os.environ, "MOCK_PORT": str(mock_port), "MOCK_LOG": str(mock_log)})
    time.sleep(1.2)

    lead_endpoint = "http://127.0.0.1:%d/api/lead" % mock_port
    build(lead_endpoint)
    has_video = make_demo_video(OUT)
    base, httpd = serve(OUT)
    print("serving %s%s\n" % (base, "" if has_video else
                              "  (no ffmpeg: the demo lane will be skipped)"))

    blocked: list[str] = []
    console_errors: list[str] = []

    try:
        with sync_playwright() as pw:
            browser = pw.chromium.launch(headless=not args.headed)

            # --- 1. layout at every viewport, every locale ------------------
            def open_page(width: int, height: int):
                ctx = browser.new_context(viewport={"width": width, "height": height},
                                          device_scale_factor=2)
                pg = ctx.new_page()
                # An uncaught exception is the signal. "Failed to load resource"
                # is not: every analytics host is aborted on purpose below, and
                # the browser reports each abort as a console error with no URL
                # in the text, so filtering those by string would be guesswork.
                pg.on("pageerror", lambda e: console_errors.append(str(e)))
                pg.route("**/*", lambda route: (
                    blocked.append(route.request.url) or route.abort())
                    if any(h in route.request.url for h in
                           ("connect.facebook.net", "facebook.com/tr", "posthog.com"))
                    else route.continue_())
                return pg

            print("Layout: horizontal overflow at %d widths x %d locales%s"
                  % (len(VIEWPORTS), len(LOCALES),
                     "  (--self-test: these MUST fail)" if args.self_test else ""))
            pages = {}
            for width, height, label in VIEWPORTS:
                pages[width] = open_page(width, height)
                print("  %dx%d, the %s" % (width, height, label))
                for path, locale in LOCALES:
                    pages[width].goto(base + path, wait_until="networkidle")
                    if args.self_test:
                        pages[width].evaluate(CANARY_JS)
                    m = pages[width].evaluate(OVERFLOW_JS)
                    detail = "scrollWidth - innerWidth = %dpx" % m["over"]
                    if m["culprits"]:
                        detail += "; widest: " + "; ".join(m["culprits"])
                    check(m["over"] <= 0,
                          "%s has no horizontal overflow at %dpx" % (locale, width),
                          detail)

            # Everything below is about behaviour, not layout, so it runs once,
            # on the phone: the width the traffic actually arrives at.
            page = pages[360]

            # --- 2. the iOS zoom guard --------------------------------------
            print("\nForm inputs at 16px or more, so iOS does not zoom on focus")
            page.goto(base + "/", wait_until="networkidle")
            small = page.evaluate("""() => {
              const out = [];
              for (const el of document.querySelectorAll('input, select, textarea')) {
                const px = parseFloat(getComputedStyle(el).fontSize);
                if (px < 16) out.push((el.id || el.name || el.tagName) + ' ' + px + 'px');
              }
              return out;
            }""")
            fields = page.evaluate(
                "() => document.querySelectorAll('input, select, textarea').length")
            check(fields > 0, "the form is actually on the page", "%d fields" % fields)
            check(not small, "every field is >= 16px", ", ".join(small) or "all ok")

            # --- 3. what the page tells Meta, in order ----------------------
            print("\nMeta pixel: every call the page makes, read from fbq.queue")
            page.goto(base + "/", wait_until="networkidle")
            on_load = fbq_calls(page)
            check([c[:2] for c in on_load] == [["init", FAKE_PIXEL_ID],
                                               ["track", "PageView"]],
                  "on load the pixel gets init + PageView and nothing else",
                  json.dumps([c[:2] for c in on_load]))

            if has_video:
                page.wait_for_selector("video", timeout=5000)
                page.evaluate("() => document.querySelector('video')"
                              ".dispatchEvent(new Event('play'))")
                page.wait_for_timeout(200)
                view = [c for c in fbq_calls(page)
                        if c[:2] == ["track", "ViewContent"]]
                check(len(view) == 1, "playing the demo sends one ViewContent",
                      json.dumps(view[0][2] if view else None))
                check(bool(view) and view[0][2].get("content_name") == "demo_video",
                      "and it names demo_video, the only ViewContent this site "
                      "sends",
                      json.dumps(view[0][2] if view else None))
            else:
                print("  SKIP  the demo lane: no ffmpeg to synthesise "
                      "public/demo.mp4")

            # P-6, measured rather than read.
            before = len(fbq_calls(page))
            page.evaluate("""() => {
              const el = document.querySelector('#pricing, [id*=pric], .price');
              (el || document.body).scrollIntoView({block: 'center'});
              window.scrollTo(0, document.body.scrollHeight * 0.6);
            }""")
            page.wait_for_timeout(1200)
            after_pricing = fbq_calls(page)
            new_calls = [c[:3] for c in after_pricing[before:]]
            check(not any(
                c[:2] == ["track", "ViewContent"] and
                isinstance(c[2], dict) and c[2].get("content_name") == "pricing"
                for c in after_pricing),
                "P-6: no ViewContent(content_name='pricing') is ever sent",
                "pixel calls added by scrolling to pricing: %s"
                % (json.dumps(new_calls) if new_calls else "none"))

            # --- 4. phone attribution, end to end in a browser --------------
            print("\nPhone attribution (batch C's fix) through a real page load")
            page.goto(base + "/?utm_source=phone&utm_medium=call"
                             "&utm_campaign=cold-call&source=outreach",
                      wait_until="networkidle")
            page.fill("#f-company_name", "Vesterled Revision")
            page.fill("#f-work_email", "lars@vesterled.dk")
            page.fill("#f-phone", "+45 20 11 22 33")
            page.select_option("#f-team_size", "10-24")
            page.select_option("#f-email_client", "outlook")
            page.select_option("#f-role", "owner_partner")
            page.click("button[type=submit]")
            page.wait_for_timeout(1500)

            received = []
            if mock_log.exists():
                received = [json.loads(line) for line in
                            mock_log.read_text(encoding="utf-8").splitlines() if line]
            last = received[-1] if received else {}
            body = last.get("body", last)
            check(bool(received), "the mock webhook received the lead",
                  "%d payload(s)" % len(received))
            check(body.get("source") == "outreach",
                  "a phone lead is attributed to outreach, not direct",
                  "source=%r utm=%s" % (body.get("source"),
                                        json.dumps(body.get("utm"))))

            after_submit = fbq_calls(page)
            lead = [c for c in after_submit if c[:2] == ["track", "Lead"]]
            check(len(lead) == 1, "submitting sends exactly one Lead", str(len(lead)))
            # pixelTrack always passes a third argument, so an event with no
            # properties arrives as ['track', 'Lead', undefined] and reads back
            # as a trailing null, not as a two-element call.
            props = lead[0][2] if lead and len(lead[0]) > 2 else None
            check(bool(lead) and not props,
                  "P-6: that Lead still carries no properties",
                  json.dumps(lead[0]) if lead else "no Lead at all")

            # --- 5. nothing broke --------------------------------------------
            print("\nHousekeeping")
            check(not console_errors, "no uncaught javascript errors",
                  "; ".join(console_errors[:3]) or "none")
            check(bool(blocked), "analytics hosts were blocked, not called",
                  "%d request(s) aborted" % len(blocked))

            browser.close()
    finally:
        httpd.shutdown()
        mock.terminate()
        if not args.keep:
            shutil.rmtree(OUT, ignore_errors=True)
            mock_log.unlink(missing_ok=True)

    print()
    if failures:
        print("%d check(s) failed:" % len(failures))
        for f in failures:
            print("  - %s" % f)
        return 1
    print("all checks passed in a real browser")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
