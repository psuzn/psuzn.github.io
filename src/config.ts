import type { Site, SocialObjects } from "./types";

export const SITE: Site = {
  website: "https://sujanpoudel.me/", // replace this with your deployed domain
  author: "Sujan Poudel",
  desc: "Personal blog and contents by psuzn",
  title: "Sujan Poudel",
  ogImage: "default-og.png",
  lightAndDarkMode: true,
  postPerPage: 3,
};

export const LOCALE = {
  lang: "en", // html lang code. Set this empty and default will be "en"
  langTag: ["en-EN"], // BCP 47 Language Tags. Set this empty [] to use the environment default
} as const;

export const LOGO_IMAGE = {
  enable: false,
  svg: true,
  width: 216,
  height: 46,
};

export const SOCIALS: SocialObjects = [
  {
    name: "Github",
    href: "https://github.com/psuzn",
    linkTitle: ` ${SITE.title} on Github`,
    active: true,
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/psuzn/",
    linkTitle: `${SITE.title} on LinkedIn`,
    active: true,
  },
  {
    name: "Twitter",
    href: "https://twitter.com/psuzn",
    linkTitle: `${SITE.title} on Twitter`,
    active: true,
  },
];
