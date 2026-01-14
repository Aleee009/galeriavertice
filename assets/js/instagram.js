/* =========================
   STATE
========================= */
const IG = {
  posts: [
    { id:1, likes:1245, saved:false, comments:[
      "ana.morales wow 😍",
      "david.creativo la composición es brutal",
      "lucia.visual me flipa el color 🎨",
      "martin.photo esto transmite muchísimo",
      "sofia.jpg qué vibe tan bonita ✨",
      "nerea.art lo guardo 🔖"
    ]},
    { id:2, likes:980, saved:false, comments:[
      "raul.editor qué atmósfera 😮‍💨",
      "marta.visual muy editorial",
      "clara.studio increíble trabajo 👏",
      "jorge.crea parece una portada de revista",
      "ines.photo me encanta este mood 🖤"
    ]},
    { id:3, likes:2100, saved:false, comments:[
      "alba.art wow",
      "diego.visual esto parece una galería 😍",
      "carmen.studio arte puro",
      "pablo.creativo me quedé mirándolo un rato",
      "luis.photo qué pasada 🔥🔥",
      "marina.jpg esto es otro nivel"
    ]},
    { id:4, likes:1567, saved:false, comments:[
      "andrea.vogue esto podría estar en vogue 😭",
      "sergio.light la luz es perfecta",
      "noelia.film muy cinematográfico 🎬",
      "laura.visual me encanta esta estética",
      "tomas.crea guardado 🔖"
    ]},
    { id:5, likes:432, saved:false, comments:[
      "elena.minimal qué paz transmite 😌",
      "nico.design minimalismo puro",
      "paula.art me gusta mucho",
      "dani.clean súper clean ✨",
      "vane.studio me da calma verlo"
    ]},
    { id:6, likes:2875, saved:false, comments:[
      "adrian.museum esto es nivel museo 🖼️",
      "lucas.art una obra de arte",
      "cloe.visual wow wow wow",
      "mateo.crea me explota la cabeza 🤯",
      "irene.photo qué locura",
      "leo.studio increíble 🔥"
    ]},
    { id:7, likes:904, saved:false, comments:[
      "paola.concept muy conceptual",
      "hugo.visual tiene mucha personalidad",
      "silvia.art me encanta este rollo 🖤",
      "roberto.crea no es lo típico",
      "abril.photo se nota la intención 👀"
    ]},
    { id:8, likes:1760, saved:false, comments:[
      "clara.frame qué encuadre tan limpio",
      "daniel.portada parece una portada 😍",
      "lola.studio muy elegante",
      "marcos.jpg me flipa esta foto",
      "nuria.visual estética 10/10 ✨"
    ]}
  ],
  active: 0
};

/* =========================
   GRID → POST
========================= */
document.querySelectorAll(".grid a").forEach((el,i)=>{
  el.addEventListener("click",()=>{
    localStorage.setItem("igActive",i);
  });
});

IG.active = Number(localStorage.getItem("igActive") || 0);

/* =========================
   LIKE SYSTEM
========================= */
document.querySelectorAll(".like").forEach(btn=>{
  btn.addEventListener("click",()=>{
    const post = IG.posts[IG.active];
    post.likes++;
    animateLike(btn);
    updateLikes();
  });
});

function updateLikes(){
  const box = document.querySelector(".likes-count");
  if(box){
    box.textContent = IG.posts[IG.active].likes.toLocaleString() + " likes";
  }
}

function animateLike(btn){
  btn.classList.toggle("active");

  const heart = document.createElement("div");
  heart.className = "like-float";
  heart.innerText = "❤️";
  document.body.appendChild(heart);

  const rect = btn.getBoundingClientRect();
  heart.style.left = rect.left + "px";
  heart.style.top  = rect.top  + "px";

  setTimeout(()=>heart.remove(),800);
}

/* =========================
   DOUBLE TAP LIKE
========================= */
document.querySelectorAll(".post-media img").forEach(img=>{
  img.addEventListener("dblclick",()=>{
    const btn = document.querySelector(".like");
    if(btn) btn.click();
  });
});

/* =========================
   COMMENTS
========================= */
document.querySelectorAll(".post-add-comment input").forEach(input=>{
  input.addEventListener("keydown",e=>{
    if(e.key==="Enter" && e.target.value.trim()!==""){
      const list = document.querySelector(".post-comments");
      const p = document.createElement("div");
      p.className="comment";
      p.innerHTML = "<strong>tú</strong> " + e.target.value;
      list.appendChild(p);

      IG.posts[IG.active].comments.push(e.target.value);
      e.target.value="";
    }
  });
});

/* =========================
   SAVE
========================= */
document.querySelectorAll(".save").forEach(btn=>{
  btn.addEventListener("click",()=>{
    const post = IG.posts[IG.active];
    post.saved = !post.saved;
    btn.textContent = post.saved ? "🔖" : "📑";
  });
});

/* =========================
   REELS SWIPE
========================= */
let reels = document.querySelectorAll(".reel");
let reelIndex = 0;

window.addEventListener("wheel",e=>{
  if(!document.body.classList.contains("reels")) return;
  if(e.deltaY>0 && reelIndex<reels.length-1) reelIndex++;
  if(e.deltaY<0 && reelIndex>0) reelIndex--;
  reels[reelIndex].scrollIntoView({behavior:"smooth"});
});

/* =========================
   FOLLOW MODAL (IG REAL)
========================= */
const followBtn = document.getElementById("followBtn");
const modal = document.getElementById("followModal");

if(followBtn && modal){

  followBtn.addEventListener("click",()=>{

    /* Si NO sigues → seguir */
    if(!followBtn.classList.contains("following")){
      followBtn.classList.add("following");
      followBtn.textContent = "Siguiendo ▾";
      return;
    }

    /* Si ya sigues → abrir popup */
    modal.classList.add("active");
  });

  /* Cerrar modal */
  modal.addEventListener("click",e=>{
    if(e.target === modal) modal.classList.remove("active");
  });

  modal.querySelector(".close").addEventListener("click",()=>{
    modal.classList.remove("active");
  });

  /* Dejar de seguir */
  modal.querySelector(".modal-item.danger").addEventListener("click",()=>{
    followBtn.classList.remove("following");
    followBtn.textContent = "Seguir";
    modal.classList.remove("active");
  });
}
