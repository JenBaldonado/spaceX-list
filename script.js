const API_URL = "https://api.spacexdata.com/v4/launches/";

const itemsCont = document.getElementById("display"),
  card = document.getElementById("card"),
  loader = document.querySelector(".preloader"),
  form = document.getElementById("form"),
  search = document.getElementById("search"),
  message = document.getElementById("message");

let allItems = [];
const itemLimit = 5;
let initialIndex = 0;

/* ----- Fetch data from the URL ----- */
async function fetchAPI(url) {
  const res = await fetch(url);
  const data = await res.json();

  return data;
}

fetchAPI(API_URL)
  .then((items) => {
    allItems = [...allItems, ...items];
    renderItems();
  })
  .catch((err) => {
    console.log("rejected:", err.message);
  });

/* ------ End of Fetch data from the API URL ------- */

/* ------ Display Format of fetched data from the API to the Browser ----- */
function showItems(items) {
  for (let item of items) {
    const { details, name, flight_number, date_local } = item;

    const itemElement = document.createElement("div");
    itemElement.classList.add("item");
    itemElement.innerHTML = `
        <div class="container d-flex my-auto py-2">
          <img src="img/SpaceX-Logo.wine.png">
            <div id="details">
              <h4>Flight number ${flight_number}: ${name} (${date_local/* .slice(0,4) */})</h4>
              <p><b>Details:</b> ${details}</p>
            </div>
        </div>
    `;
    itemsCont.appendChild(itemElement);
  }
}

//This observes every last element in the batches of array
const itemObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((item) => {
      if (item.isIntersecting) {
        //show the loader gif
        loader.classList.add("show");
        //stop observing the last item
        itemObserver.unobserve(item.target);
      }
    });
  },
  {
    root: itemsCont,
    threshold: 0.3,
  }
);

const renderItems = () => {
  showItems(allItems.slice(initialIndex, initialIndex + itemLimit));

  //fetch all the rendered items and get a reference of the last item
  const renderedItems = document.querySelectorAll(".item");
  initialIndex = renderedItems.length; //set new dynamic values so that more items will be added
  const lastRenderedItem = renderedItems[renderedItems.length - 1];

  itemObserver.observe(lastRenderedItem);

  const lastLimit = initialIndex + itemLimit;

  const finalItem = allItems.length + 5;
  //once the bottom is reach hide loader then show a message
  if (lastLimit === finalItem) {
    loader.classList.remove("show");
    itemObserver.unobserve(lastRenderedItem);
    message.innerText = "There is no more items to show.";
  }
};

/* ------ loader observer ----- */

const loaderObserver = new IntersectionObserver((entries) => {
  entries.forEach((loading) => {
    //loader is visible at first then will be hidden once the first 5 items is generated
    loader.classList.toggle("show", loading.isIntersecting);
    if (loading.isIntersecting) {
      // if the loader is intersecting generate more items then loader will be hidden
      setTimeout(() => {
        renderItems();
      }, 500);
    }
  }),
    {
      root: itemsCont,
      threshold: 0.3,
    };
});

loaderObserver.observe(loader);

/* ----- SEARCH EVENT FUNCTION ------ */
/* const SEARCH_API = "https://api.spacexdata.com/v4/launches/query/";

async function searchItems(url){
  const res = await fetch(url,
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      }
    })
  if (!res.ok) {
    console.log("An error occured", err.message)
  }
  const result = await res.json();

  console.log(result.docs)
  showItems(result.docs);
}

searchItems(SEARCH_API);
 */
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const searchTerm = search.value;

  if (searchTerm && searchTerm !== "") {
    showItems(API_URL + searchTerm);
    console.log('search')

    search.value = "";
  } else {
    window.location.reload();
  }
});
