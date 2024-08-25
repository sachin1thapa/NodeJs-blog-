const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const otpGenerator = require('otp-generator')

//! User Authentication

const { user } = require("../../model");
const sendEmail = require('../../utils/nodeMailer');
const { OTPlength } = require('../../constant');

// signup page 
exports.signupPage = (req, res) => {
    return res.render('signup')
}

// signup user data 
exports.signupUser = async (req, res) => {
    const { username, email, password } = req.body;


    if (!username || !email || !password || username.length < 2) {
        return res.render('signup', {
            error: "Please fill in all fields."
        });

    }

    try {
        // Hash the password
        let newpassword = await bcrypt.hash(password, 10);

        // Create new user
        await user.create({
            username,
            email,
            password: newpassword
        });
        return res.render('login');
    } catch (error) {

        console.error('Error:', error);
        return res.render('signup', {
            error: "An error occurred during registration. Please try again."
        });
    }
}

// login page 

exports.loginPage = (req, res) => {
    return res.render('login')
}

// login user

exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    console.log(email, password);

    try {
        // Find the user by email
        const [userExist] = await user.findAll({
            where: { email }
        });
        // console.log(userExist.id);

        if (!userExist) {
            return res.render('login', {
                error: "User does not exist. Please sign up."
            });
        }

        // Validate password
        const validPassword = await bcrypt.compare(password, userExist.password);
        if (!validPassword) {
            return res.render('login', {
                error: "Invalid password. Please try again."
            });
        } else {

            //! setting of the  jWT token
            const token = jwt.sign({ id: userExist.id }, String(process.env.JWT_SECRET), {
                expiresIn: '15d'

            })


            //! this will set the cookie in the browser
            res.cookie('token', token, {
                // expires: new Date(Date.now() + 1 * 60 * 1000),
                expires: new Date(Date.now() + 3600000), // cookie will be removed after 1 hour
                httpOnly: true,
                secure: true
            });
        }

        // If login is successful, redirect to the homepage

        res.redirect('/');
    } catch (error) {
        console.error('Error:', error);
        res.render('login', {
            error: "An unexpected error occurred. Please try again."
        });
    }
}

exports.logoutUser = (req, res) => {
    res.clearCookie('token')
    res.redirect('/')
}


exports.recoverPasswordPage = (req, res) => {
    return res.render('auth/recoverPage', {
        error: null,
        isotp: false,
        email: null
        // email: "thapasachin572@gmail.com"
    })
}

exports.checkuser = async (req, res) => {
    const email = req.body.email;
    console.log(email);
    if (!email) {
        console.log("Enter the mail to proceed ");
        return res.render('auth/recoverPage', {
            error: "Enter the email to proceed ",
            isotp: false,
            email: null
        })
    }

    const [userExist] = await user.findAll({
        where: {
            email: email
        }
    })

    if (!userExist) {
        console.log("User does not exist ");
        return res.render('auth/recoverPage', {
            error: "The user with that mail does not exit ",
            isotp: false,
            email: email
        })
    }


    const generatedOTP = otpGenerator.generate(OTPlength, // package bata generate gare ko 
        {
            lowerCaseAlphabets: false,
            upperCaseAlphabets: false,
            specialChars: false
        });

    console.log(generatedOTP);
    // return

    await sendEmail({
        email: email,
        subject: "NodeBlog : Reset the Password ",
        otp: generatedOTP
    })

    // update the otp and the otpGeneratedTime in the database
    // TODO: hashed the otp before saving it to the database
    userExist.otp = await bcrypt.hash(generatedOTP, 10);
    userExist.otpGeneratedTime = Date.now()
    await userExist.save();         // save the update to the database 
    return res.render(`auth/recoverPage`, {
        error: null,
        isotp: true,
        email: email
    })
}

exports.handelOTP = async (req, res) => {
    const generatedOTP = req.body.otp
    const email = String(req.params.id)
    if (!(generatedOTP || email))
        return res.send("Enter the email or the Otp")
    const [data] = await user.findAll({
        where: {
            email: email,
        }
    })

    const userExist = await bcrypt.compare(generatedOTP, data.otp)

    console.log(userExist);
    if (!userExist) {
        console.log("doest match the code");
        res.send("The OTP does not match")
    } else {
        const currentTime = Date.now();
        const otpGeneratedTime = userExist.otpGeneratedTime

        // check if the otp has been expired or not
        if (currentTime - otpGeneratedTime > 2 * 60 * 1000) {
            console.log("OTP has been expired")
            return res.send("OTP has been expired")
        } else {
            console.log("OTP has been verified");
            // return res.render('auth/resetPassword', {
            //     email: email
            // })
            data.otp = null;
            data.otpGeneratedTime = null;
            await data.save();
            return res.send("OTP has been verified")
        }


    }
    return
}