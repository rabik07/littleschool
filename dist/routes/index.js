"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const homeController_1 = require("../controllers/homeController");
const studentController_1 = require("../controllers/studentController");
const teacherController_1 = require("../controllers/teacherController");
const billingController_1 = require("../controllers/billingController");
const historyController_1 = require("../controllers/historyController");
const router = express_1.default.Router();
// Home routes
router.get('/', homeController_1.HomeController.index);
// Student routes
router.get('/students', studentController_1.StudentController.list);
router.get('/students/new', studentController_1.StudentController.showForm);
router.get('/students/admission', studentController_1.StudentController.admissionForm);
router.post('/students', studentController_1.StudentController.create);
router.get('/students/:id', studentController_1.StudentController.details);
router.post('/students/:id', studentController_1.StudentController.update);
router.post('/students/:id/move-to-history', studentController_1.StudentController.moveToHistory);
router.post('/students/admission/submit', studentController_1.StudentController.submitAdmission);
// Teacher routes
router.get('/teachers', teacherController_1.TeacherController.list);
router.get('/teachers/new', teacherController_1.TeacherController.showForm);
router.post('/teachers', teacherController_1.TeacherController.create);
router.get('/teachers/:id', teacherController_1.TeacherController.details);
// Billing routes
router.get('/billing', billingController_1.BillingController.index);
router.post('/billing/fee', billingController_1.BillingController.submitFee);
router.post('/billing/salary', billingController_1.BillingController.submitSalary);
router.post('/billing/add-payment', billingController_1.BillingController.addPayment);
// History routes
router.get('/history', historyController_1.HistoryController.index);
// About page route
router.get('/about', (req, res) => {
    res.render('about', { title: 'About' });
});
exports.default = router;
