const csrf = require("csurf");
const cookieParser = require("cookie-parser");

app.use(cookieParser());
app.use(csrf({ cookie: true }));

// Inject CSRF token in views
app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
});
