const posts = window.posts;
console.log("🚀 script.js has loaded successfully!");
window.setUsername = function () {
  const input = document.getElementById("username-input").value.trim();
  if (input) {
    localStorage.setItem("username", input); // Store username
    document.getElementById("username-container").style.display = "none"; // Hide input box
    document.getElementById("app").style.display = "block"; // Show feed
    username = input; // Set global username
    renderFeed(); // Ensure the feed loads properly
  } else {
    alert("Please enter a username.");
  }
};

let username = localStorage.getItem("username");

if (username) {
  document.getElementById("username-container").style.display = "none";
  document.getElementById("app").style.display = "block";
}

let likeCount = 0;

//setupVideoAutoplay
function setupVideoAutoplay() {
  // make video play sound
  let userHasInteracted = false; // Track if the user has scrolled

  document.addEventListener("scroll", () => {
    if (!userHasInteracted) {
      document.querySelectorAll(".video-post").forEach((video) => {
        video.muted = false; // 🔊 Unmute all videos once scrolling starts
      });
      userHasInteracted = true; // Prevent further changes
    }
  }); // make video play sound

  const videos = document.querySelectorAll(".video-post");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target
            .play()
            .catch((error) => console.warn("Autoplay prevented:", error));
        } else {
          entry.target.pause();
        }
      });
    },
    { threshold: 0.9 }
  );

  videos.forEach((video) => {
    observer.observe(video);

    const playOverlay = video.parentElement.querySelector(".play-overlay"); // ✅ Finds the correct overlay for each video
    playOverlay.classList.remove("hidden"); // ✅ Show play button on page load

    video.addEventListener("click", () => {
      if (video.paused) {
        video.play();
        playOverlay.classList.add("hidden"); // ✅ Hide play button when playing
      } else {
        video.pause();
        playOverlay.classList.remove("hidden"); // ✅ Show play button when paused
      }
    });

    video.addEventListener("play", () => {
      setTimeout(() => playOverlay.classList.add("hidden"), 100); // ✅ Ensure it fades out after play starts
    });

    video.addEventListener("pause", () => {
      playOverlay.classList.remove("hidden"); // ✅ Show play button when paused
    });
  });
}

// Function to shuffle posts using Fisher-Yates algorithm
// function shufflePosts() {
//for (let i = posts.length - 1; i > 0; i--) {
//let j = Math.floor(Math.random() * (i + 1));
//[posts[i], posts[j]] = [posts[j], posts[i]]; // Swap elements
//}
//}

// Function to render posts
function renderFeed() {
  //shufflePosts(); // Randomize posts before rendering
  const feed = document.getElementById("feed");
  feed.innerHTML = ""; // Clear existing content

  posts.forEach((post, index) => {
    const postElement = document.createElement("div");
    postElement.classList.add("post");

    let mediaContent = "";
    if (post.type === "image") {
      mediaContent = `<img src="${post.media[0]}" alt="Post image">`;
    } else if (post.type === "video") {
      mediaContent = `
      <div class="video-container">
      <video class="video-post" muted loop playsinline>
          <source src="${post.media[0]}" type="video/mp4">
          Your browser does not support the video tag.
      </video>
      <div class="play-overlay hidden"></div> <!-- ✅ This is the only play button now -->
  </div>
      `;
    } else if (post.type === "carousel") {
      mediaContent = `
        <div class="carousel-container">
            <button class="carousel-btn left" onclick="prevImage(${index})">&lt;</button>
            <img id="carousel-${index}" src="${post.media[0]}" alt="Carousel Image">
            <button class="carousel-btn right" onclick="nextImage(${index})">&gt;</button>
            <div class="carousel-indicator" id="indicator-${index}">1 / ${post.media.length}</div>
        </div>
      `;
    }

    postElement.innerHTML = `
      <div class="post-header">
        <div class="avatar-wrapper">
          <img src="${post.profilePic}" alt="Avatar">
        </div>
        <span class="username">${post.username}</span>
      </div>
      ${mediaContent}
      <div class="post-date">${post.date}</div>
      <p>${post.caption
        .replace(/\n/g, "<br>")
        .replace(/#\w+/g, '<span class="hashtag">$&</span>')}</p>
      <div class="post-actions">
          <img id="like-btn-${index}" src="https://raw.githubusercontent.com/ruochongji/affordancePSIPSR/main/ins-like1.png" 
               alt="Like" class="action-icon" onclick="window.likePost(${index})">
          <img id="comment-btn-${index}" src="https://raw.githubusercontent.com/ruochongji/affordancePSIPSR/main/ins-comment.png"
               alt="Comment" class="action-icon" onclick="window.toggleComment(${index})">
      </div>
      <div id="comment-section-${index}" class="comment-section hidden">
          <div class="comment-input-container">
              <input type="text" id="comment-input-${index}" placeholder="Add a comment...">
              <img id="send-comment-${index}" src="https://raw.githubusercontent.com/ruochongji/affordancePSIPSR/main/ins-sendcomment.png" 
                   alt="Send" class="send-icon" onclick="window.addComment(${index})">
          </div>
          <ul id="comments-${index}"></ul>
      </div>
    `;

    feed.appendChild(postElement);
    updateComments(index);
  });

  setupVideoAutoplay(); // ✅ Ensure observer is set up after rendering
}

// Function to switch to the next image in the carousel
window.nextImage = function (index) {
  if (posts[index].type === "carousel") {
    if (posts[index].currentIndex < posts[index].media.length - 1) {
      posts[index].currentIndex++;
      console.log(
        `➡️ Next Image: Now showing ${posts[index].currentIndex + 1} / ${
          posts[index].media.length
        }`
      );
      updateCarousel(index);
    }
  }
};

// Function to switch to the previous image in the carousel
window.prevImage = function (index) {
  if (posts[index].type === "carousel") {
    if (posts[index].currentIndex > 0) {
      posts[index].currentIndex--;
      console.log(
        `⬅️ Previous Image: Now showing ${posts[index].currentIndex + 1} / ${
          posts[index].media.length
        }`
      );
      updateCarousel(index);
    }
  }
};

// Function to update the carousel display, including the indicator
function updateCarousel(index) {
  let post = posts[index];

  console.log(
    `🔄 Updating carousel ${index}: Now at ${post.currentIndex + 1} / ${
      post.media.length
    }`
  );

  let imageElement = document.getElementById(`carousel-${index}`);
  let indicatorElement = document.getElementById(`indicator-${index}`);

  if (imageElement) {
    imageElement.src = post.media[post.currentIndex]; // Update the image
  } else {
    console.warn(`❌ Image element "carousel-${index}" not found.`);
  }

  if (indicatorElement) {
    indicatorElement.textContent = `${post.currentIndex + 1} / ${
      post.media.length
    }`; // Fix: Removed extra parentheses
  } else {
    console.warn(`❌ Indicator element "indicator-${index}" not found.`);
  }
}

// Function to like a post (only once)
window.likePost = function (index) {
  let likeBtn = document.getElementById(`like-btn-${index}`);
  if (!posts[index].liked) {
    posts[index].likes++;
    posts[index].liked = true;
    likeCount++; // Increase total like count
    likeBtn.src =
      "https://raw.githubusercontent.com/ruochongji/affordancePSIPSR/main/ins-like2.png";
  } else {
    posts[index].likes--;
    posts[index].liked = false;
    likeCount--; // Decrease total like count if unliked
    likeBtn.src =
      "https://raw.githubusercontent.com/ruochongji/affordancePSIPSR/main/ins-like1.png";
  }
  // ✅ Send updated data to Qualtrics on every like
  sendCommentsToQualtrics();
};

// Function to add a comment
window.addComment = function (index) {
  const input = document.getElementById(`comment-input-${index}`);
  if (input.value.trim()) {
    posts[index].comments.push(input.value);
    updateComments(index);
    input.value = ""; // Clear input
  }
};

// Function to update comments
function updateComments(index) {
  const commentList = document.getElementById(`comments-${index}`);
  commentList.innerHTML = ""; // Clear and re-add comments

  posts[index].comments.forEach((comment) => {
    const newComment = document.createElement("li");
    newComment.textContent = comment;

    // 🚨 THIS FORCES THE COMMENTS TO BE ON A NEW LINE 🚨
    newComment.style.display = "block";
    newComment.style.width = "100%";
    newComment.style.marginTop = "5px";
    newComment.style.wordWrap = "break-word";
    newComment.style.clear = "both"; // 💥 Ensures no floating elements next to it

    commentList.appendChild(newComment);
  });

  // 🚀 FORCES THE BROWSER TO RERENDER THE COMMENTS 🚀
  commentList.style.display = "none";
  setTimeout(() => (commentList.style.display = "block"), 10);
}

// Load the feed when the page loads
renderFeed();

// Global variable to store all comments
let collectedComments = [];

window.addComment = function (index) {
  const input = document.getElementById(`comment-input-${index}`);
  if (input.value.trim()) {
    let comment = `${localStorage.getItem("username")}: ${input.value.trim()}`;
    posts[index].comments.push(comment);
    collectedComments.push(comment);
    updateComments(index);
    input.value = "";

    console.log("✅ New comment:", comment);

    // Send to Qualtrics
    sendCommentsToQualtrics();
  }
};

window.sendCommentsToQualtrics = function () {
  let commentsString = collectedComments.join(" | ");
  let qualtricsURL = "https://illinois.qualtrics.com";

  console.log("Sending to Qualtrics:", {
    comments: commentsString,
    likes: likeCount,
  });

  window.parent.postMessage(
    { comments: commentsString, likes: likeCount },
    qualtricsURL
  );
};

window.toggleComment = function (index) {
  let commentSection = document.getElementById(`comment-section-${index}`);
  commentSection.classList.toggle("hidden"); // Show/hide comment section
};
