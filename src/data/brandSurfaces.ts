type BrandSurface = { color:string; skipFill?:string; monochrome?:string }
export const brandSurfaces: Record<string,BrandSurface> = {
  react:{color:'#163b48'}, nextjs:{color:'#090909',skipFill:'000000'},
  typescript:{color:'#007acc',skipFill:'007acc'}, javascript:{color:'#f0db4f',skipFill:'f0db4f'},
  html5:{color:'#e34f26'},css3:{color:'#1572b6'},tailwindcss:{color:'#164e63'},
  threejs:{color:'#f2f0eb'},gsap:{color:'#124d24'},vitejs:{color:'#33244e'},
  nodejs:{color:'#315c26'},express:{color:'#f2f0eb'},python:{color:'#173c59'},
  fastapi:{color:'#065e57'},firebase:{color:'#814b08'},mongodb:{color:'#183d1d'},
  postgresql:{color:'#203f62'},supabase:{color:'#144b36'},gemini:{color:'#1c284a'},
  groq:{color:'#f55036'},git:{color:'#8e2c1c'},github:{color:'#111110',monochrome:'#f2f0eb'},
  githubactions:{color:'#163d69'},docker:{color:'#0d4b77'},vercel:{color:'#f2f0eb'},
  postman:{color:'#a64220'},vscode:{color:'#084b72'},
}
export const neutralSurface: BrandSurface={color:'#252523'}
