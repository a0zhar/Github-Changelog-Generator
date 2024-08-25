// Wait until the Web Page has fully loaded, which occures once the DOM content has fully loaded.
// Once this event occures, we continue with the code/implementation
document.addEventListener("DOMContentLoaded", function() {
  // Add a submit event listener to the form with the ID "repo-form"
  document.getElementById("repo-form").addEventListener("submit", async function(event) {
    // Prevent the default form submission behavior
    event.preventDefault();

    // Get the values from the input fields for GitHub username and repository name
    let owner = document.getElementById("username").value;
    let repo  = document.getElementById("repository").value;

    // Check if both fields have been filled out
    if (!owner || !repo) {
      // Alert the user to enter both fields if either is missing
      alert("Please enter both GitHub username and repository name.");
      return; // Exit the function early
    }

    // Attempt, to obtain the github repository structure, before formatting
    // it into HTML format, then adding it to the html element container, and
    // if an error occures, we log it first to console, then we display it in
    // the html element acting as output container
    try {
      // Fetch the repository structure from the GitHub API, then we format
      // the resulted data of the structure into HTML
      let contents           = await fetchRepoStructure(owner, repo);
      let formattedStructure = await formatStructure(owner, repo, contents);

      // Insert the formatted HTML version of the Github Repository Structure,
      // into the html element acting as the output container, that has the id
      // attribute value "repo-structure".
      document.getElementById("repo-structure").innerHTML = formattedStructure;
    } catch (error) {
      // Log the error to the console
      console.error("Error fetching repository structure:", error);

      // Display an error message in the "repo-structure" div
      document.getElementById("repo-structure").innerHTML 
        = "Error fetching repository structure.";
    }
  });

  // Function to fetch the github repository contents from the GitHub API
  async function fetchRepoStructure(owner, repo, path = "") {
    // Construct the URL to fetch repository contents
    let url = `https://api.github.com/repos/${owner}/${repo}/contents${path}`;

    // Fetch the contents from the URL
    let response = await fetch(url);

    // Check if the response is successful, if not we throw an error that
    // indicates that an error occured
    if (!response.ok) 
      throw new Error(`Failed to fetch contents from ${url}`);
    

    // Return the JSON response
    return response.json();
  }

  // Function to format the repository structure into HTML
  async function formatStructure(owner, repo, contents, path = "") {
    let result = ""; // Initialize an empty string to accumulate the result

    // Iterate through each item in the contents
    for (let item of contents) {
      if (item.type === "dir") {
        // Append the directory name to the result
        result += `<div class="directory">${path}${item.name}/</div>`;

        try {
          // Fetch the contents of the subdirectory
          const subContents = await fetchRepoStructure(owner, repo, `${path}${item.name}/`);

          // Recursively format the contents of the subdirectory
          result += await formatStructure(owner, repo, subContents, `${path}${item.name}/`);
        } catch (error) {
          // Log any errors encountered while fetching subdirectory contents
          console.error(`Error fetching contents for ${path}${item.name}/:`, error);
        }
      } else if (item.type === "file") {
        // Append the file name to the result
        result += `<div class="file">${path}${item.name}</div>`;
      }
    }

    // Return the accumulated HTML result
    return result;
  }
});
