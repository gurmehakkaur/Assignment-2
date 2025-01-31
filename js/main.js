document.addEventListener("DOMContentLoaded", () => {
    let page = 1;
    const perPage = 10;
    let searchName = null;

    const loadListingsData = () => {
        let url = `https://web422as1.onrender.com/api/listings?page=${page}&perPage=${perPage}`;
        if (searchName) url += `&name=${searchName}`;

        fetch(url)
            .then(res => {
                if (!res.ok) {
                    console.error(`Failed to fetch data, status: ${res.status}`);
                    return Promise.reject(res.status);
                }
                return res.json();
            })
            .then(data => {
                console.log("Fetched data:", data); // Log the data to the console
                const tbody = document.querySelector("#listingsTable tbody");
                tbody.innerHTML = "";

                if (data.length) {
                    tbody.innerHTML = data.map(listing => `
                        <tr data-id="${listing._id}">
                            <td><a href="${listing.listing_url}" target="_blank">${listing.name}</a></td>
                            <td>${listing.room_type || "Not specified"}</td>
                            <td>${listing.host_location || "Location not available"}</td>
                            <td>
                                ${listing.summary || "No summary available."}<br><br>
                                <strong>Accommodates:</strong> ${listing.accommodates || "Not specified"}<br>
                                <strong>Rating:</strong> ${listing.number_of_reviews ? `${listing.number_of_reviews} Reviews` : "No reviews"}<br>
                                <img src="${listing.images.picture_url}" alt="${listing.name}" width="150" />
                            </td>
                        </tr>
                    `).join("");
                    document.querySelector("#current-page").textContent = page;
                    addRowClickEvents();
                } else {
                    if (page > 1) {
                        page--;
                        loadListingsData();
                    } else {
                        tbody.innerHTML = "<tr><td colspan='4'><strong>No data available</strong></td></tr>";
                    }
                }
            })
            .catch(error => {
                console.error("Error fetching data:", error);
                document.querySelector("#listingsTable tbody").innerHTML = "<tr><td colspan='4'><strong>No data available</strong></td></tr>";
            });
    };

    const addRowClickEvents = () => {
        document.querySelectorAll("#listingsTable tbody tr").forEach(row => {
            row.addEventListener("click", () => {
                const id = row.getAttribute("data-id");
                fetch(`https://web422as1.onrender.com/api/listings/${id}`)
                    .then(res => res.json())
                    .then(data => {
                        document.querySelector("#detailsModal .modal-title").textContent = data.name;
                        document.querySelector("#detailsModal .modal-body").innerHTML = `
                            <img id="photo" class="img-fluid w-100" src="${data.images?.picture_url || 'https://placehold.co/600x400?text=Photo+Not+Available'}" onerror="this.onerror=null;this.src='https://placehold.co/600x400?text=Photo+Not+Available'">
                            <br><br>
                            ${data.neighborhood_overview || "No overview available."}<br><br>
                            <strong>Price:</strong> $${parseFloat(data.price).toFixed(2)}<br>
                            <strong>Room:</strong> ${data.room_type}<br>
                            <strong>Bed:</strong> ${data.bed_type} (${data.beds})<br><br>
                        `;
                        new bootstrap.Modal(document.querySelector("#detailsModal")).show();
                    });
            });
        });
    };

    document.querySelector("#prev-page").addEventListener("click", () => {
        if (page > 1) {
            page--;
            loadListingsData();
        }
    });

    document.querySelector("#next-page").addEventListener("click", () => {
        page++;
        loadListingsData();
    });

    document.querySelector("#search-btn").addEventListener("click", () => {
        searchName = document.querySelector("#search-name").value;
        loadListingsData();
    });

    loadListingsData();
});
