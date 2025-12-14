import express from 'express';
import { HomeController } from '../controllers/homeController';
import { StudentController } from '../controllers/studentController';
import { TeacherController } from '../controllers/teacherController';
import { BillingController } from '../controllers/billingController';
import { HistoryController } from '../controllers/historyController';

const router = express.Router();

// Home routes
router.get('/', HomeController.index);

// Student routes
router.get('/students', StudentController.list);
router.get('/students/new', StudentController.showForm);
router.post('/students', StudentController.create);
router.get('/students/:id', StudentController.details);
router.post('/students/:id', StudentController.update);
router.post('/students/:id/move-to-history', StudentController.moveToHistory);

// Teacher routes
router.get('/teachers', TeacherController.list);
router.get('/teachers/new', TeacherController.showForm);
router.post('/teachers', TeacherController.create);
router.get('/teachers/:id', TeacherController.details);

// Billing routes
router.get('/billing', BillingController.index);
router.post('/billing/fee', BillingController.submitFee);
router.post('/billing/salary', BillingController.submitSalary);
router.post('/billing/add-payment', BillingController.addPayment);

// History routes
router.get('/history', HistoryController.index);

// About page route
router.get('/about', (req, res) => {
	res.render('about', { title: 'About' });
});

export default router;


