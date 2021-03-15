const express=require('express');
const router=express.Router();
const bcrypt=require('bcryptjs');
const passport=require('passport');
const User=require('../models/User');
///login route
router.get('/login',(req,res)=>{
    res.render('login');
});


// register route
router.get('/register',(req,res)=>{
res.render('register');
});


//register post
router.post('/register',(req,res)=>{
  const {name,email,password,password2}=req.body;
 let errors=[];
    if(!name||!email||!password||!password2)
    {
        errors.push({msg:'please fill all the fields'});
    }

    if(password!==password2)
    {
        errors.push({msg:"password don't match"});
    }

    if(password.length<6){
        errors.push({msg:"password length should be minimum 6 characters long"});
    }

    if(errors.length>0){
        res.render('register',{
            errors:errors,
            name:name,
            email:email,
            password:password,
            password2:password2
        });
    }else{
        //validate
        User.findOne({email: email})
        .then((user)=>{
            if(user)
            {
                errors.push({msg:"email already exist"});
                res.render('register',{
                    errors:errors,
                    name:name,
                    email:email,
                    password:password,
                    password2:password2
                });  
            }
            else{
                const newUser=new User({
                    name:name,
                    email:email,
                    password:password
                });
                //hash password
              bcrypt.genSalt(10,(err,salt)=>
              {
                  bcrypt.hash(newUser.password,salt,(err,hash)=>{
                      if(err) throw err;

                      newUser.password=hash;
                      newUser.save()
                      .then((user)=>{
                          req.flash('success_msg','now you can log in');
                          res.redirect('/users/login');
                      })
                      .catch(err=>console.log(err));
                  });
              });  
        

            }
        });
    }



})

//login route
router.post('/login',(req,res,next)=>{
passport.authenticate('local',{
successRedirect:'/dashboard',
failureRedirect:'/users/login',
failureFlash: true
})(req,res,next);
});


//logout

router.get('/logout',(req,res)=>{

    req.logout();
    req.flash('success_msg','you are now logged out');
    res.redirect('/users/login');
});



module.exports=router;