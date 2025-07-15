import express from "express";
import bodyParser from "body-parser";
import multer from "multer";
import { dirname } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const port = 3000;
var postIndex = 0;

var posts = [];
app.use(express.static("public"));

const diskStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, __dirname + "/public/images");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: diskStorage });
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.render("index.ejs");
});
app.post("/submit", upload.single("uploadFile"), (req, res) => {
  postIndex = postIndex + 1;
  var currentDate = new Date();
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(currentDate);
  var data = {
    id: postIndex,
    title: req.body["title"],
    fileName: req.file.originalname,
    date: formattedDate,
    category: req.body["category"],
    content: req.body["content"],
    writer: req.body["writer"],
  };

  posts.push(data);

  res.render("index.ejs", { postSuccess: true });
});

app.get("/viewPost", (req, res) => {
  res.render("viewPost.ejs", { posts: posts });
});

app.get("/editPost/:id", (req, res) => {
  const index = parseInt(req.params.id);
  console.log(posts);
  var postLookUp = {};
  posts.forEach((post) => {
    console.log(index);
    if (post.id === index) {
      postLookUp = post;
    }
  });
  console.log(postLookUp);
  if (Object.keys(postLookUp).length != 0) {
    res.render("editPost.ejs", { post: postLookUp });
  } else {
    res
      .status(404)
      .send(
        `No post available with this id <a href="/">click to add a post</a>`
      );
  }
});

app.post("/update/:id", upload.single("uploadFile"), (req, res) => {
  console.log(req.body);
  const index = parseInt(req.params.id);
  var postLookUp = {};
  posts.forEach((post) => {
    if (post.id === index) {
      post.title = req.body.title;

      post.category = req.body.category;
      post.content = req.body.content;
      post.writer = req.body.writer;
      if (req.file) {
        post.fileName = req.file.originalname;
      } else {
        post.fileName = post.fileName;
      }

      postLookUp = post;
    }
  });

  res.render("editPost.ejs", { updateSucess: true, post: postLookUp });
});
app.get("/cancelEdit", (req, res) => {
  res.render("viewPost.ejs", { posts: posts });
});

app.get("/deletePost/:id", (req, res) => {
  const index = parseInt(req.params.id);

  posts.forEach((post) => {
    if (post.id === index) {
      const deleteIndex = posts.indexOf(post);
      posts.splice(deleteIndex, 1);
    }
  });

  res.render("viewPost.ejs", { posts: posts });
});

app.listen(port, () => {
  console.log("Listensing to server on port 3000");
});
