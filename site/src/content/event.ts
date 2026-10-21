export const event = {
  title: "Build Your Balanced Team",
  subtitle: "A Miro x Devin Buildathon",
  date: "Sunday, December 7, 2026",
  time: "6:00–10:00 PM",
  venue: {
    name: "The Dock Miami",
    address: "400 NW 26th Street, Miami, FL",
  },
  lumaUrl:
    process.env.NEXT_PUBLIC_LUMA_URL ?? "https://luma.com/os4376pi",
  perks: [
    "Free Devin credits for every attendee",
    "Food and drinks provided",
    "Small, hands-on room (30 seats)",
  ],
  overview:
    "We all have the ability to wear many hats, and now we can have a system at our disposal that wears many hats too. This series of hands-on sessions in Miami is about putting that system to work. Together, Miro and Devin give you a balanced team. Miro is where you and your collaborators think, plan, design and decide. Devin is the AI engineer that builds, tests and ships what you decided. In this session, we take one real app from user feedback to shipped changes on a single Miro board, show what each part of that team does, and then you put the same system to work on your own project.",
  positioning:
    "Miro is where you think, plan, design and decide. Devin is the AI engineer that builds, tests and ships.",
  demos: [
    {
      name: "You vote, Devin builds",
      blurb:
        "The room gives feedback and votes on a change. Devin starts building it in the background while we demo.",
    },
    {
      name: "Feedback to shipped",
      blurb:
        "From action items on the board to approved changes built in parallel, with results posted back to the board.",
    },
    {
      name: "Feasibility check before you toggle",
      blurb:
        "Devin estimates effort and risk for each proposed change before the team picks.",
    },
    {
      name: "Architecture you can see",
      blurb:
        "Devin proposes a technical change; Miro shows what it means for users; the room approves.",
    },
  ],
  agenda: [
    { time: "6:00", title: "Doors, food and welcome" },
    { time: "6:20", title: "Host intros and what Miro x Devin is" },
    { time: "6:35", title: "You vote, Devin builds" },
    {
      time: "6:50",
      title:
        "Live demo: feedback to shipped, feasibility check, architecture you can see",
    },
    { time: "7:40", title: "Hands-on build with office hours" },
    {
      time: "9:15",
      title: "Show-and-tell: reveal the opening build, attendee shares",
    },
    { time: "9:45", title: "Closing" },
  ],
  audience: [
    {
      group: "Building your own thing",
      segments: [
        {
          name: "Solo builders and owners",
          blurb:
            "Founders, solopreneurs, freelancers and side-project builders who wear every hat. Get a system that wears the other hats so the product keeps improving without hiring.",
        },
        {
          name: "Small teams",
          blurb:
            "Early-stage startups, agencies and nonprofits running on a handful of people. One board where the whole team decides, and an AI engineer that turns decisions into working changes.",
        },
      ],
    },
    {
      group: "Leveling up your work life",
      segments: [
        {
          name: "Teams inside larger companies",
          blurb:
            "PMs and teammates losing time to handoffs. Take home workflows: run a design review in one meeting, prioritize with real engineering effort in view, understand the codebase your team owns.",
        },
      ],
    },
  ],
  bring: [
    "A laptop",
    "A GitHub account",
    "A project on GitHub, or use our starter app if you bring only an idea",
    "A free Miro account",
    "A Devin account (we'll share a link for free credits at the door)",
  ],
  hosts: [
    {
      name: "Mia",
      role: "Organizer · runs the Miro portions",
      bio: "Bio coming soon.",
    },
    {
      name: "Jerry Pierre",
      role: "Cognition ambassador for Miami · runs the Devin portions",
      bio: "Bio coming soon.",
    },
  ],
  series:
    "This is the first of several Miami sessions on one theme: with Miro and Devin together, you have a balanced team at your disposal. Each event shows a different side of that team at work.",
} as const;
