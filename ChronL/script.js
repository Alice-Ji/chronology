const feedPosts = window.posts;
console.log("🚀 script.js has loaded successfully!");

window.setUsername = function () {
  const input = document.getElementById("username-input").value.trim();
  if (input) {
    localStorage.setItem("username", input);
    document.getElementById("username-container").style.display = "none";
    document.getElementById("app").style.display = "block";
    username = input;
    renderFeed();
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
  let userHasInteracted = false;

  document.addEventListener("scroll", () => {
    if (!userHasInteracted) {
      document.querySelectorAll(".video-post").forEach((video) => {
        video.muted = false;
      });
      userHasInteracted = true;
    }
  });

  const videos = document.querySelectorAll(".video-post");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.play().catch(() => {});
        } else {
          entry.target.pause();
        }
      });
    },
    { threshold: 0.9 }
  );

  videos.forEach((video) => {
    observer.observe(video);

    const playOverlay = video.parentElement.querySelector(".play-overlay");
    playOverlay.classList.remove("hidden");

    video.addEventListener("click", () => {
      if (video.paused) {
        video.play();
        playOverlay.classList.add("hidden");
      } else {
        video.pause();
        playOverlay.classList.remove("hidden");
      }
    });

    video.addEventListener("play", () => {
      setTimeout(() => playOverlay.classList.add("hidden"), 100);
    });

    video.addEventListener("pause", () => {
      playOverlay.classList.remove("hidden");
    });
  });
}

// Render feed
function renderFeed() {
  const feed = document.getElementById("feed");
  feed.innerHTML = "";

  feedPosts.forEach((post, index) => {
    const postElement = document.createElement("div");
    postElement.classList.add("post");

    let mediaContent = "";

    if (post.type === "image") {
      mediaContent = `<img src="${post.media[0]}">`;
    } else if (post.type === "video") {
      mediaContent = `
        <div class="video-container">
          <video class="video-post" muted loop playsinline>
            <source src="${post.media[0]}" type="video/mp4">
          </video>
          <div class="play-overlay hidden"></div>
        </div>
      `;
    } else if (post.type === "carousel") {
      mediaContent = `
        <div class="carousel-container">
          <button class="carousel-btn left" onclick="prevImage(${index})">&lt;</button>
          <img id="carousel-${index}" src="${post.media[0]}">
          <button class="carousel-btn right" onclick="nextImage(${index})">&gt;</button>
          <div class="carousel-indicator" id="indicator-${index}">
            1 / ${post.media.length}
          </div>
        </div>
      `;
    }

    postElement.innerHTML = `
      <div class="post-header">
        <img class="avatar" src="${post.profilePic}">
        <span class="username">${post.username}</span>
      </div>

      ${mediaContent}

      <div class="post-date">${post.date}</div>

      <p>${post.caption
        .replace(/\n/g, "<br>")
        .replace(/#\w+/g, '<span class="hashtag">$&</span>')}</p>

      <div class="post-actions">
        <img id="like-btn-${index}" class="action-icon"
          src="https://raw.githubusercontent.com/ruochongji/affordancePSIPSR/main/ins-like1.png"
          onclick="likePost(${index})">

        <img id="comment-btn-${index}" class="action-icon"
          src="https://raw.githubusercontent.com/ruochongji/affordancePSIPSR/main/ins-comment.png"
          onclick="toggleComment(${index})">
      </div>

      <div id="comment-section-${index}" class="comment-section hidden">
        <div class="comment-input-container">
          <input id="comment-input-${index}" placeholder="Add a comment...">
          <img class="send-icon"
            src="https://raw.githubusercontent.com/ruochongji/affordancePSIPSR/main/ins-sendcomment.png"
            onclick="addComment(${index})">
        </div>
        <ul id="comments-${index}"></ul>
      </div>
    `;

    feed.appendChild(postElement);
    updateComments(index);
  });

  setupVideoAutoplay();
}

// Carousel
window.nextImage = function (index) {
  let post = feedPosts[index];
  if (post.currentIndex < post.media.length - 1) {
    post.currentIndex++;
    updateCarousel(index);
  }
};

window.prevImage = function (index) {
  let post = feedPosts[index];
  if (post.currentIndex > 0) {
    post.currentIndex--;
    updateCarousel(index);
  }
};

function updateCarousel(index) {
  let post = feedPosts[index];

  document.getElementById(`carousel-${index}`).src =
    post.media[post.currentIndex];

  document.getElementById(`indicator-${index}`).textContent =
    `${post.currentIndex + 1} / ${post.media.length}`;
}

// Like
window.likePost = function (index) {
  let post = feedPosts[index];
  let btn = document.getElementById(`like-btn-${index}`);

  if (!post.liked) {
    post.likes++;
    post.liked = true;
    likeCount++;
    btn.src =
      "https://raw.githubusercontent.com/ruochongji/affordancePSIPSR/main/ins-like2.png";
  } else {
    post.likes--;
    post.liked = false;
    likeCount--;
    btn.src =
      "https://raw.githubusercontent.com/ruochongji/affordancePSIPSR/main/ins-like1.png";
  }

  sendCommentsToQualtrics();
};

// Comments
let collectedComments = [];

window.addComment = function (index) {
  const input = document.getElementById(`comment-input-${index}`);

  if (input.value.trim()) {
    let comment = `${localStorage.getItem("username")}: ${input.value.trim()}`;

    feedPosts[index].comments.push(comment);
    collectedComments.push(comment);

    updateComments(index);
    input.value = "";

    sendCommentsToQualtrics();
  }
};

function updateComments(index) {
  const list = document.getElementById(`comments-${index}`);
  list.innerHTML = "";

  feedPosts[index].comments.forEach((comment) => {
    const li = document.createElement("li");
    li.textContent = comment;
    list.appendChild(li);
  });
}

// Qualtrics
window.sendCommentsToQualtrics = function () {
  let commentsString = collectedComments.join(" | ");

  window.parent.postMessage(
    { comments: commentsString, likes: likeCount },
    "https://illinois.qualtrics.com"
  );
};

// Toggle comments
window.toggleComment = function (index) {
  document
    .getElementById(`comment-section-${index}`)
    .classList.toggle("hidden");
};

// Load feed
renderFeed();
