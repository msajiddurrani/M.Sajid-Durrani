import type { Project } from './portfolio'

// Selected public repositories, checked against their source and live pages.
// The original portfolio.ts project history remains intact.
export const featuredProjects: Project[] = [
  {
    id:'savyora', name:'Savyora Fitness', category:'Fitness / Club & membership experience',
    context:'A complete club experience for exploring facilities, training, coaching and membership options.',
    architecture:[
      'Next.js App Router pages connect facilities, training windows, coaching and membership information.',
      'Enquiry forms assemble WhatsApp messages in the visitor’s browser.',
      'Shared responsive navigation and motion keep the experience consistent across devices.',
    ],
    stack:[{tech:'Next.js',source:'R'},{tech:'React',source:'R'},{tech:'TypeScript',source:'R'},{tech:'CSS',source:'R'},{tech:'WhatsApp enquiries',source:'R'}],
  },
  {
    id:'vangaurd', name:'Vanguard Athletic Lab', category:'Fitness technology / Diet & training tools',
    context:'An athletic workspace bringing calorie and macro tools, structured training and AI-assisted diagnostics together.',
    architecture:[
      'Dedicated calculator, exercise-library and academy routes support diet and workout planning.',
      'Firebase authentication connects protected athlete workspace and academy experiences.',
      'The diagnostics interface accepts text, image uploads and browser speech input.',
    ],
    stack:[{tech:'Next.js',source:'R'},{tech:'TypeScript',source:'R'},{tech:'Firebase',source:'R'},{tech:'Motion',source:'R'},{tech:'Gemini API',source:'R'}],
  },
  {
    id:'sop-voice', name:'SOP Forge', category:'Enterprise AI / Voice triage',
    context:'A voice-triage engine that interprets employee calls and routes intent to the relevant enterprise department.',
    architecture:[
      'A Next.js dashboard streams audio over WebSockets to a separate FastAPI service.',
      'Groq-based intent routing and ElevenLabs speech output support the conversational workflow.',
      'Supabase schemas organize call logging and tracking.',
    ],
    stack:[{tech:'Next.js',source:'R'},{tech:'FastAPI',source:'R'},{tech:'Python',source:'R'},{tech:'WebSockets',source:'R'},{tech:'Groq',source:'R'},{tech:'ElevenLabs',source:'R'},{tech:'Supabase',source:'R'}],
  },
  {
    id:'axiom-crm', name:'Axiom CRM', category:'SaaS / Customer relationship management',
    context:'A connected sales workspace for contacts, deal pipelines, interactions and tasks.',
    architecture:[
      'Firebase Authentication and Google sign-in protect access to the sales workspace.',
      'Firestore listeners synchronize contacts, deals, interactions and tasks in real time.',
      'User-scoped data rules separate customer records, with responsive desktop and mobile interfaces.',
    ],
    stack:[{tech:'React',source:'R'},{tech:'TypeScript',source:'R'},{tech:'Vite',source:'R'},{tech:'Firebase',source:'R'},{tech:'Tailwind CSS',source:'R'},{tech:'Motion',source:'R'}],
  },
  {
    id:'creamy', name:'Creamy', category:'Commerce / Artisanal ice cream',
    context:'A playful storefront for exploring flavors, building a signature tub and managing a shopping bag.',
    architecture:[
      'A flavor customizer combines bases, swirls, toppings, drizzle and tub sizes with price calculation.',
      'Product discovery and a shared cart drawer support standard and custom selections.',
      'React, Vite and Motion connect the responsive storefront and flavor-led presentation.',
    ],
    stack:[{tech:'React',source:'R'},{tech:'TypeScript',source:'R'},{tech:'Vite',source:'R'},{tech:'Tailwind CSS',source:'R'},{tech:'Motion',source:'R'}],
  },
]
