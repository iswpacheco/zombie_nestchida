var bcrypt = require("bcrypt-nodejs");
var mongoose = require("mongoose");

var SALT_FACTOR = 10;

var zombieSchema = mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    displayName: { type: String },
    bio: String,
    rol: { type: String, required: true }
});

var equipmentSchema = mongoose.Schema({
    description: { type: String, required: true },
    defense: { type: Number, required: true },
    category: { type: String },
    weight: Number
});

var donothing = () => {}

zombieSchema.pre("save", function(done) {
    var zombie = this;
    if (!zombie.isModified("password")) {
        return done();
    }
    bcrypt.genSalt(SALT_FACTOR, (err, salt) => {
        if (err) {
            return done(err);
        }
        bcrypt.hash(zombie.password, salt, donothing, (err, hashedpassword) => {
            if (err) {
                return done(err);
            }
            zombie.password = hashedpassword;
            done();
        });
    });
});


zombieSchema.methods.checkPassword = function(guess, done) {
    bcrypt.compare(guess, this.password, function(err, isMatch) {
        done(err, isMatch);
    });
}

zombieSchema.methods.name = function() {
    return this.displayName || this.username;
}
zombieSchema.methods.roles = function() {
    return this.rol || this.rol;
}


var Zombie = mongoose.model("Zombie", zombieSchema);
module.exports = Zombie;