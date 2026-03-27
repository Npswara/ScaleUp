import youtubesearchapi from "youtube-search-api";
console.log("youtubesearchapi type:", typeof youtubesearchapi);
console.log("youtubesearchapi keys:", Object.keys(youtubesearchapi || {}));
if (youtubesearchapi && (youtubesearchapi as any).default) {
  console.log("youtubesearchapi.default keys:", Object.keys((youtubesearchapi as any).default));
}
