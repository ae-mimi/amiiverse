export const THEME_QUERY = `
{
  "settings": *[_type == "settings" && _id == "settings"][0]{
    theme
  },
  "activeCampaign": *[_type == "campaign" && status == "live" && (!defined(startDate) || startDate <= now()) && (!defined(endDate) || endDate >= now())][0]{
    themeOverride
  }
}
`;
