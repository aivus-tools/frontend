interface RouteTitleEntry {
  match: RegExp;
  title: string;
}

const ROUTE_TITLES: RouteTitleEntry[] = [
  { match: /^\/app\/dashboard\/new-brief\/details\/?$/, title: 'New brief' },
  { match: /^\/app\/dashboard\/[^/]+\/details\/?$/, title: 'Project details' },
  { match: /^\/app\/dashboard\/[^/]+\/timing\/?$/, title: 'Timing' },
  { match: /^\/app\/dashboard\/[^/]+\/estimation\/?$/, title: 'Estimation' },
  { match: /^\/app\/dashboard\/[^/]+\/offer\/?$/, title: 'Offer' },
  { match: /^\/app\/dashboard\/[^/]+\/presentation\/?$/, title: 'Presentation' },
  { match: /^\/app\/dashboard\/[^/]+\/analysis\/?$/, title: 'Analysis' },
  { match: /^\/app\/dashboard\/[^/]+\/?$/, title: 'Project' },
  { match: /^\/app\/dashboard\/?$/, title: 'Dashboard' },
  { match: /^\/app\/brief\/create\/?$/, title: 'New brief' },
  { match: /^\/app\/brief\/claim\/[^/]+\/?$/, title: 'Claim brief' },
  { match: /^\/app\/brief\/[^/]+\/comparison\/?$/, title: 'Comparison' },
  { match: /^\/app\/brief\/[^/]+\/?$/, title: 'Brief' },
  { match: /^\/app\/templates\/[^/]+\/?$/, title: 'Edit template' },
  { match: /^\/app\/templates\/?$/, title: 'Templates' },
  { match: /^\/app\/rates\/?$/, title: 'Rates' },
  { match: /^\/app\/profile\/?$/, title: 'Profile' },
  { match: /^\/app\/settings\/?$/, title: 'Settings' },
  { match: /^\/app\/group\/?$/, title: 'Choose your role' },
  { match: /^\/app\/confirm\/?$/, title: 'Confirm e-mail' },
];

export const resolveAppTitle = (pathname: string): string => {
  for (const entry of ROUTE_TITLES) {
    if (entry.match.test(pathname)) {
      return entry.title;
    }
  }
  return 'Aivus';
};
