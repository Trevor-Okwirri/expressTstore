const express = require('express');
const router = express.Router();
const Cart = require('./models/Cart');
const Product = require('./models/Product');
const User = require('./models/User');
const Order = require('./models/Order');
var SHA256 = require('crypto-js/sha256');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const emailValidator = require('email-validator');

authenticateAdminToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).send('Access Denied');
  } else {
    jwt.verify(token, 'trevorokwirri@1234', (error, user) => {
      if (error) {
        return res.status(403).send(error);
      } else {
        if (user.user.accountType == 'Admin') {
          req.user = user.user;
          next();
        } else {
          console.log(user.user);
          return res.status(403).send(user);
        }
      }
    });
  }
};
authenticateUserToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).send('Access Denied');
  } else {
    jwt.verify(token, 'trevorokwirri@1234', (error, user) => {
      if (error) {
        return res.sendStatus(403)('Action not allowed');
      } else {
        if (user.accountType == 'User') {
          req.user = user;
          next();
        } else {
          return res.status(403).send('Action not allowed');
        }
      }
    });
  }
};
authenticateUserAndAdminToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).send('Access Denied');
  } else {
    jwt.verify(token, 'trevorokwirri@1234', (error, user) => {
      if (error) {
        return res.sendStatus(403)('Action not allowed');
      } else {
        if (user.accountType == 'User') {
          req.user = user;
          next();
        } else if (user.accountType == 'Admin') {
          req.user = user;
          next();
        } else {
          return res.status(403).send('Action not allowed');
        }
      }
    });
  }
};

//Get all products

router.get('/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.send(products);
  } catch (error) {
    res.send(error);
  }
});

router.get('/carts', authenticateAdminToken, async (req, res) => {
  try {
    const carts = await Cart.find();
    res.send(carts);
  } catch (error) {
    res.send(error);
  }
});

router.post('/products', authenticateAdminToken, async (req, res) => {
  try {
    const product = new Product({
      name: req.body.name,
      imagesUrl: req.body.imagesUrl,
      category: req.body.category,
      price: req.body.price,
      manufacturer: req.body.manufacturer,
      seller: req.body.seller,
      description: req.body.description,
    });

    await product.save();

    res.send(product);
  } catch (error) {
    res.send(error);
  }
});

router.delete('/products', authenticateAdminToken, async (req, res) => {
  try {
    await Product.deleteOne({ name: req.body.name }).then(() =>
      res.send('Product deleted successfully.')
    );
  } catch (error) {
    res.send(error);
  }
});

router.post('/orders', async (req, res) => {
  try {
    const cartDetails = await Cart.findOne({
      data: { userId: req.body.userId },
    });

    const order = new Order({
      orderId: cartDetails._id,
      userId: req.body.userId,
      items: cartDetails.items,
      isPaid: req.body.isPaid,
      subTotal: cartDetails.subTotal,
      paymentMethod: req.body.paymentMethod,
    });

    await order.save();

    await Cart.deleteOne({ data: { userId: req.body.userId } });

    user = await User.findById(req.body.userId);

    console.log(user);

    d = new Date();

    months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    const data = {
      currency: 'USD',
      marginTop: 25,
      marginRight: 25,
      marginLeft: 25,
      marginBottom: 25,
      sender: {
        company: 'T-STORE Corp',
        address: 'Ngere Kagoro, Awasi',
        city: 'Kisumu',
        country: 'Kenya',
      },
      client: {
        name: user.name,
        country: user.country,
      },
      information: {
        date: d.getDate(),
        month: months[d.getMonth()],
        time: d.getTime(),
        year: d.getFullYear(),
      },
      products: cartDetails.items,
      subtotal: 'Kshs ' + cartDetails.subTotal,
      bottomNotice: 'Thank you for shopping at T-store, Moving Together',
    };

    console.log(data);
    //easyInvoice.createInvoice(data, function (result) {
    //console.log(result.pdf)
    //}
    //)
    res.send(data);
  } catch (error) {
    res.send(error);
  }
});

router.get('/orders', authenticateAdminToken, async (req, res) => {
  try {
    const orders = await Order.find();
    res.send(orders);
  } catch (error) {
    res.send(error);
  }
});

router.post('/register', async (req, res) => {
  try {
    if (emailValidator.validate(req.body.email)) {
      const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: SHA256(req.body.password),
        deliveryAddress: req.body.deliveryAddress,
        country: req.body.country,
        accountType: req.body.accountType,
      });

      await user.save();

      res.send(user);
    } else {
      res.status(400).send('Invalid Email');
    }
  } catch (error) {
    res.send(error);
  }
});

router.get('/verify', (req, res) => {
  try {
    token = req.query.id;
    if (token) {
      try {
        jwt.verify(token, 'trevor', async (e, decoded) => {
          if (e) {
            console.log(e);
            return res.sendStatus(403);
          } else {
            id = decoded.id;
            await User.findByIdAndUpdate(id, { $set: { isVerified: true } });
            res.send('User verification successful');
          }
        });
      } catch (err) {
        console.log(err);
        return res.sendStatus(403);
      }
    } else {
      return res.sendStatus(403);
    }
  } catch (error) {
    res.send(error);
  }
});

router.delete('/user', authenticateUserAndAdminToken, async (req, res) => {
  try {
    account = await User.findOne({ userId: req.body.userId });

    if (req.body.password == account.password) {
      await User.deleteOne({ userId: req.body.userId });
      res.send('User account deleted successfully');
    } else {
      res.send('Account deletion failed');
    }
  } catch (error) {
    res.send(error);
  }
});

router.get('/users', authenticateAdminToken, async (req, res) => {
  try {
    accounts = await User.find();
    res.send(accounts);
  } catch (error) {
    console.log(error);
  }
});

router.post('/verification', async (req, res) => {
  try {
    user = await User.findOne({ email: req.body.email });

    console.log(user);
    date = new Date();

    var mail = {
      id: user._id,
      created: date.toString(),
    };

    console.log(mail);
    const token_mail_verification = jwt.sign(mail, 'trevor', {
      expiresIn: '1h',
    });

    console.log(token_mail_verification);
    url = 'https://express-tstore.vercel.app/api/';

    var url = url + 'verify?id=' + token_mail_verification;

    let transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: 'tokwirri@gmail.com',
        pass: 'znncsmvottxqjmrv',
      },
    });

    let info = await transporter.sendMail(
      {
        from: '"T-Store" tokwirri@gmail.com',
        to: user.email,
        subject: 'Account Verification',
        text: 'Click on the link below to verify your account ' + url,
      },
      (error, info) => {
        if (error) {
          res.send(error);
          return;
        }
        res.send(info);
        transporter.close();
      }
    );
  } catch (error) {
    res.send(error);
  }
});

router.post('/cart/:userId', authenticateUserToken, async (req, res) => {
  try {
    const userId = req.params.userId;
    const itemId = req.body.itemId;
    const quantity = Number.parseInt(req.body.quantity);

    console.log(quantity);
    //Get users cart
    let cart = await Cart.findOne({
      userId: userId,
    });

    //Get selected Product Details
    const productDetails = await Product.findById(itemId);

    //Check if cart exists and check the quantity of items
    if (cart) {
      let indexFound = cart.items.findIndex((p) => p.itemId == itemId);
      console.log('Index', indexFound);

      //Check if product exists, just add the previous quantity with the new quantity and update the price
      if (indexFound != -1) {
        cart.items[indexFound].quantity =
          cart.items[indexFound].quantity + quantity;

        cart.items[indexFound].total =
          cart.items[indexFound].quantity * productDetails.price;

        cart.items[indexFound].price = productDetails.price;

        cart.subTotal = cart.items
          .map((item) => item.total)
          .reduce((acc, curr) => acc + curr);
      }
      //Check if quantity is greater 0 then add item to items array
      else if (quantity > 0) {
        cart.items.push({
          itemId: itemId,
          quantity: quantity,
          price: productDetails.price,
          total: parseInt(productDetails.price * quantity).toFixed(2),
        });
        cart.subTotal = cart.items
          .map((item) => item.total)
          .reduce((acc, curr) => acc + curr);
      }

      //if quantity of price is 0 throw an error
      else {
        return res.status(400).json({
          code: 400,
          message: 'Invalid request',
        });
      }

      data = await cart.save();
    }

    //if there is no user with a cart then it creates a new cart and then adds the item to the cart that has been created
    else {
      const cartData = {
        userId: userId,
        items: [
          {
            itemId: itemId,
            quantity: quantity,
            total: parseInt(productDetails.price * quantity),
            price: productDetails.price,
          },
        ],
        subTotal: parseInt(productDetails.price * quantity),
      };
      cart = new Cart(cartData);
      data = await cart.save();
    }

    return res.status(200).send({
      code: 200,
      message: 'Add to cart successfully!',
      data: data,
    });
  } catch (error) {
    res.send(error);
  }
});

router.delete('/carts/:userId', authenticateUserToken, async (req, res) => {
  try {
    await Cart.deleteOne({ userId: req.params.userId }).then(() =>
      res.send('Product deleted successfully.')
    );
  } catch (error) {
    res.send(error);
  }
});

router.get('/orders/:userId', authenticateUserToken, async (req, res) => {
  try {
    const orders = await Order.findMany({ userId: req.params.userId });
    res.send(orders);
  } catch (error) {
    res.send(error);
  }
});

module.exports = router;
