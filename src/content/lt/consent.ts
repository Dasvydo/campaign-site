import type { Content } from '../types';

export const consent: Content['consent'] = {
  title: 'Slapukai šiame puslapyje',
  body: 'Apsilankymų skaičiavimas ir reklama. Nė vienas neveikia, kol nesutinkate.',
  accept: 'Sutinku',
  decline: 'Nesutinku',
  detailsLabel: 'Ką daro kiekvienas',
  items: [
    {
      name: 'Apsilankymų skaičiavimas',
      body: '„PostHog“, talpinama ES. Kurios dalys skaitomos ir kiek toli žemyn nuslenkama. Jokių sesijų įrašų, jokių šilumos žemėlapių.',
    },
    {
      name: 'Reklama',
      body: '„Meta“ pikselis. Leidžia rodyti reklamą „Facebook“ ir „Instagram“ tiems, kurie lankėsi šiame puslapyje.',
    },
  ],
  note: 'Nesutikimas nieko nekeičia nei puslapyje, nei skaičiuotame pavyzdyje, nei formoje. Apsigalvoti galite puslapio apačioje.',
  privacyLabel: 'Privatumo politika',
  statusGranted: 'Sutikta',
  statusDenied: 'Nesutikta',
  statusUnset: 'Nepasirinkta',
  reopenLabel: 'Keisti slapukų pasirinkimą',
};
