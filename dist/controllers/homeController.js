"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HomeController = void 0;
class HomeController {
    static index(req, res) {
        res.render('home/index', {
            title: 'Home - School Management System'
        });
    }
}
exports.HomeController = HomeController;
