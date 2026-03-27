import youtubesearchapi from "youtube-search-api";

async function test() {
  try {
    const results = await youtubesearchapi.GetListByKeyword("test", false, 1);
    console.log("Results:", JSON.stringify(results, null, 2));
  } catch (error) {
    console.error("Error:", error);
  }
}

test();
