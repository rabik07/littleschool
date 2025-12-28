"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeacherController = void 0;
const Teacher_1 = require("../models/Teacher");
class TeacherController {
    static async list(req, res) {
        try {
            const teachers = await Teacher_1.Teacher.getAll();
            res.render('teachers/list', {
                title: 'Teachers',
                teachers
            });
        }
        catch (error) {
            console.error('Error fetching teachers:', error);
            res.status(500).send('Error loading teachers');
        }
    }
    static showForm(req, res) {
        res.render('teachers/form', {
            title: 'Add New Teacher',
            teacher: null
        });
    }
    static async create(req, res) {
        const { name, subject, email, phone, address, joiningDate, salary } = req.body;
        try {
            await Teacher_1.Teacher.create({
                name,
                subject,
                email,
                phone,
                address,
                joiningDate,
                salary: parseFloat(salary)
            });
            res.redirect('/teachers');
        }
        catch (error) {
            console.error('Error creating teacher:', error);
            res.render('teachers/form', {
                title: 'Add New Teacher',
                error: 'Failed to create teacher'
            });
        }
    }
    static async details(req, res) {
        try {
            const { id } = req.params;
            const teacher = await Teacher_1.Teacher.getById(id);
            if (!teacher) {
                return res.status(404).send('Teacher not found');
            }
            res.render('teachers/details', {
                title: `Teacher Details - ${teacher.name}`,
                teacher
            });
        }
        catch (error) {
            console.error('Error fetching teacher details:', error);
            res.status(500).send('Error loading teacher details');
        }
    }
}
exports.TeacherController = TeacherController;
