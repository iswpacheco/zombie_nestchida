var express = require("express");
var Zombie = require("./models/zombie");
var Equipment = require("./models/equipment");
var passport = require("passport");
var acl = require('express-acl');

var router = express.Router();

router.use((req, res, next) => {
    res.locals.currentZombie = req.zombie;
    res.locals.errors = req.flash("error");
    res.locals.infos = req.flash("info");
    if (req.zombie) {
        req.session.rol = req.zombie.rol;
    }
    if (req.session.rol == undefined) {
        acl.config({

            defaultRole: 'invitado',

        });
    } else {
        acl.config({

            defaultRole: req.session.rol
        });
    }
    next();
});

router.use(acl.authorize);

router.get("/login", (req, res) => {
    res.render("login");
});

router.post("/login", passport.authenticate("login", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true
}));

router.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
});

//router.get("/signup", (req, res, next)=>{
router.get("/signup", (req, res) => {
    res.render("signup");
});

router.post("/signup", (req, res, next) => {
    var username = req.body.username;
    var password = req.body.password;
    var rol = req.body.rol;

    Zombie.findOne({ username: username }, (err, zombie) => {
        if (err) {
            return next(err);
        }
        if (zombie) {
            req.flash("error", "El nombre de usuario ya lo ha usado otro zombie");
            return res.redirect("/signup");
        }
        var newZombie = new Zombie({
            username: username,
            password: password,
            rol: rol
        });
        newZombie.save(next);
        return res.redirect("/");
    });
});

router.get("/", (req, res, next) => {
    Zombie.find()
        .sort({ createdAt: "descending" })
        .exec((err, zombies) => {
            if (err) {
                return next(err);
            }
            res.render("index", { zombies: zombies });
        });
});

router.get("/zombies/:username", (req, res, next) => {
    Zombie.findOne({ username: req.params.username }, (err, zombie) => {
        if (err) {
            return next(err);
        }
        if (!zombie) {
            return next(404);
        }
        res.render("profile", { zombie: zombie });
    });
});

router.get("/equip", (req, res, next) => {
    res.render("equip");
});

router.post("/equip", (req, res, next) => {
    var description = req.body.description;
    var defense = req.body.defense;
    var category = req.body.category;
    var weight = req.body.weight;

    Equipment.findOne((err) => {

        var newEquip = new Equipment({
            description: description,
            defense: defense,
            category: category,
            weight: weight
        });
        newEquip.save(next);
        return res.redirect("/equipment");
    });
});

router.get("/Equipment", (req, res, next) => {
    Equipment.find()
        .exec((err, equipo) => {
            if (err) {
                return next(err);
            }
            res.render("zombieEq", { equipo: equipo });
        });

});

router.get("/edit", ensureAuthenticated, (req, res) => {
    res.render("edit");
})

router.post("/edit", ensureAuthenticated, (req, res, next) => {
    req.zombie.displayName = req.body.displayName;
    req.zombie.bio = req.body.bio;
    req.zombie.save((err) => {
        if (err) {
            next(err);
            return;
        }
        req.flash("info", "Perfil actualizado!");
        res.redirect("/edit");
    });
});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        req.flash("info", "Necesitas iniciar sesion para poder ver esta seccion");
        res.redirect("/login")
    }
}

module.exports = router;