const express = require("express");
const bodyParser = require('body-parser');
const dotenv = require("dotenv").config();
const app = express();
const db = require("./config/mongoose");
const { notFound, apiErrorHandler } = require("./midlewares/errorHandler");
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
// const authRouter = require('./routes/authRoute');
const productRouter = require('./routes/productRoute');
const blogRouter = require('./routes/blogRoute');
const categoryRouter = require('./routes/categoryRoute');
const blogCatRouter = require('./routes/blogCatRoute');
const brandRouter = require('./routes/brandRoute');
const couponRouter = require('./routes/couponRoute');
const colorRouter = require('./routes/colorRoute');

const PORT = process.env.PORT || 8000;

app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser);

// app.use('api/user', authRouter);
app.use('api/product', productRouter);
app.use('api/blog', blogRouter);
app.use('api/category', categoryRouter);
app.use('api/blog-category', blogCatRouter);
app.use('api/brand', brandRouter);
app.use('/api/coupon', couponRouter);
app.use('api/color', colorRouter);


app.use(notFound);
app.use(apiErrorHandler);



app.listen(PORT, () => {
    console.log(`Server is Up and Listening at ${PORT}`);
});


