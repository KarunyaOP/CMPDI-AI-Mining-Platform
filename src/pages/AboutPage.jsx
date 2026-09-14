import React from 'react';
import { Activity, FileCheck2, Map, ShieldCheck, Users } from 'lucide-react';

const responsibilities = [
  {
    title: 'Geological exploration',
    detail: 'Manage borehole records, seam stratigraphy, laboratory results, and exploration summaries.',
    icon: Activity
  },
  {
    title: 'Mine and pit safety',
    detail: 'Review bench stability, production achievement, equipment availability, blasting, and active safety alerts.',
    icon: ShieldCheck
  },
  {
    title: 'Compliance and approvals',
    detail: 'Track DGMS filings, Ministry MIS submissions, executive sign-offs, and subsidiary risk registers.',
    icon: FileCheck2
  },
  {
    title: 'Coalfield intelligence',
    detail: 'Use the Leaflet coalfield workspace to inspect mine markers, boreholes, layers, and telemetry details.',
    icon: Map
  },
  {
    title: 'Officer workflows',
    detail: 'Use role-based dashboards, MineGPT, Reports, Profile, and visible workflow actions from one shell.',
    icon: Users
  }
];

export default function AboutPage() {
  return (
    <div className="page-wrapper about-page">
      <header className="page-header">
        <div>
          <p className="page-kicker">About GeoIntel</p>
          <h1>GeoIntel officer platform</h1>
          <p>One calm workspace for geological evidence, mine safety, coalfield intelligence, and government reporting.</p>
        </div>
      </header>

      <section className="about-page-intro">
        <div className="about-origin-copy">
          <p className="page-kicker">From the field to the officer desk</p>
          <h2>What this website does</h2>
          <p>
            GeoIntel brings CMPDI and Coal India operational information into a role-specific dashboard.
            Each officer sees the work queue, evidence, risks, and approvals that match their responsibilities.
          </p>
        </div>
        <figure className="about-origin-image">
          <img src="/assets/mining_hero.jpg" alt="Mining operations viewed from above" />
          <figcaption>Built around the work that begins in the field.</figcaption>
        </figure>
      </section>

      <section className="about-responsibility-grid" aria-labelledby="responsibilities-title">
        <h2 id="responsibilities-title">Platform responsibilities</h2>
        <div className="about-responsibility-cards">
          {responsibilities.map(({ title, detail, icon: Icon }) => (
            <article className="about-responsibility-card" key={title}>
              <Icon size={24} />
              <div><h3>{title}</h3><p>{detail}</p></div>
            </article>
          ))}
        </div>
      </section>

      <section className="about-role-workflow">
        <h2>Who uses GeoIntel</h2>
        <div className="about-role-table-wrap">
          <table className="role-table">
            <thead><tr><th>Officer</th><th>Daily focus</th><th>Main workspace</th></tr></thead>
            <tbody>
              <tr><td>Senior Geologist</td><td>Boreholes, lab results, stratigraphy, hazard annotations</td><td>Exploration Activity and Lab Results Queue</td></tr>
              <tr><td>Mining Engineer</td><td>Production, bench stability, HEMM, blasting, safety</td><td>Production Achievement and Pit Safety</td></tr>
              <tr><td>Reporting Officer</td><td>Approvals, DGMS filings, MIS, subsidiary risks</td><td>Pending Your Sign-off and Statutory Calendar</td></tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
