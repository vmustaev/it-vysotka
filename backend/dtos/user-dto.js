module.exports = class UserDto {
    email;
    id;
    isActivated;
    first_name;
    last_name;
    second_name;

    constructor(model) {
         this.email = model.email;
         this.id = model.id;
         this.isActivated = model.isActivated;
         this.first_name = model.first_name;
         this.last_name = model.last_name;
         this.second_name = model.second_name;
    }
}