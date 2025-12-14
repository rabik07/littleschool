import { Request, Response } from 'express';
import { Billing } from '../models/Billing';
import { Student } from '../models/Student';
import { Teacher } from '../models/Teacher';
import mongoose from 'mongoose';
import { isMongoConnected } from '../config/database';

export class BillingController {
  static async index(req: Request, res: Response) {
    try {
      const students = await Student.getAll();
      const teachers = await Teacher.getAll();
      const billingRecords = await Billing.getAll();

      // derive a sorted list of unique classes from students (filter falsy values)
      const classes = Array.from(new Set(students.map((s: any) => s.class).filter(Boolean))).sort();

      // prepare a lightweight students array for client-side JS (avoid ObjectId serialization issues)
      const studentsForClient = students.map((s: any) => ({
        id: s._id ? String(s._id) : s.id,
        name: s.name,
        class: s.class,
        rollNumber: s.rollNumber
      }));

      // prepare lightweight billing records for client-side use (student fees only)
      const billingRecordsForClient = billingRecords.map((r: any) => ({
        id: r._id ? String(r._id) : r.id,
        type: r.type,
        studentId: r.studentId ? String(r.studentId) : r.studentId,
        amount: parseFloat(r.amount) || 0,
        date: r.date,
        description: r.description || ''
      }));

      // derive a sorted list of month strings (format YYYY-MM) from billing records dates
      const monthsSet = new Set<string>();
      billingRecordsForClient.forEach((br: any) => {
        if (br.date) {
          try {
            const d = new Date(br.date);
            if (!isNaN(d.getTime())) {
              const mm = String(d.getMonth() + 1).padStart(2, '0');
              const yyyy = d.getFullYear();
              monthsSet.add(`${yyyy}-${mm}`);
            }
          } catch (e) {
            // ignore parse errors
          }
        }
      });
      const months = Array.from(monthsSet).sort();

      res.render('billing/index', {
        title: 'Billing',
        students,
        studentsForClient,
        classes,
        billingRecordsForClient,
        months,
        teachers,
        billingRecords
      });
    } catch (error) {
      console.error('Error loading billing page:', error);
      res.status(500).send('Error loading billing page');
    }
  }

  static async submitFee(req: Request, res: Response) {
    const { studentId, amount, date, description } = req.body;
    
    try {
      // Validate studentId based on database type
      if (isMongoConnected) {
        if (!mongoose.Types.ObjectId.isValid(studentId)) {
          return res.redirect('/billing?error=invalid_student_id');
        }
        await Billing.create({
          type: 'student_fee',
          studentId: new mongoose.Types.ObjectId(studentId),
          amount: parseFloat(amount),
          date,
          description: description || ''
        });
      } else {
        // JSON fallback - studentId is already a string
        if (!studentId) {
          return res.redirect('/billing?error=invalid_student_id');
        }
        await Billing.create({
          type: 'student_fee',
          studentId: studentId,
          amount: parseFloat(amount),
          date,
          description: description || ''
        } as any);
      }
      res.redirect('/billing');
    } catch (error) {
      console.error('Error submitting fee:', error);
      res.redirect('/billing?error=fee_submission_failed');
    }
  }

  static async submitSalary(req: Request, res: Response) {
    const { teacherId, amount, date, description } = req.body;
    
    try {
      // Validate teacherId based on database type
      if (isMongoConnected) {
        if (!mongoose.Types.ObjectId.isValid(teacherId)) {
          return res.redirect('/billing?error=invalid_teacher_id');
        }
        await Billing.create({
          type: 'teacher_salary',
          teacherId: new mongoose.Types.ObjectId(teacherId),
          amount: parseFloat(amount),
          date,
          description: description || ''
        });
      } else {
        // JSON fallback - teacherId is already a string
        if (!teacherId) {
          return res.redirect('/billing?error=invalid_teacher_id');
        }
        await Billing.create({
          type: 'teacher_salary',
          teacherId: teacherId,
          amount: parseFloat(amount),
          date,
          description: description || ''
        } as any);
      }
      res.redirect('/billing');
    } catch (error) {
      console.error('Error submitting salary:', error);
      res.redirect('/billing?error=salary_submission_failed');
    }
  }

  static async addPayment(req: Request, res: Response) {
    const { studentId, amount, date, description, type } = req.body;
    
    try {
      // Validate input
      if (!studentId || !amount || !date) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: studentId, amount, or date'
        });
      }

      if (parseFloat(amount) <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Amount must be greater than 0'
        });
      }

      // Validate studentId based on database type
      if (isMongoConnected) {
        if (!mongoose.Types.ObjectId.isValid(studentId)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid student ID'
          });
        }
        await Billing.create({
          type: 'student_fee',
          studentId: new mongoose.Types.ObjectId(studentId),
          amount: parseFloat(amount),
          date: String(date),
          description: description || 'Student Fee Payment'
        });
      } else {
        // JSON fallback - studentId is already a string
        if (!studentId) {
          return res.status(400).json({
            success: false,
            message: 'Invalid student ID'
          });
        }
        await Billing.create({
          type: 'student_fee',
          studentId: studentId,
          amount: parseFloat(amount),
          date: String(date),
          description: description || 'Student Fee Payment'
        } as any);
      }

      return res.status(200).json({
        success: true,
        message: 'Payment recorded successfully'
      });
    } catch (error) {
      console.error('Error adding payment:', error);
      return res.status(500).json({
        success: false,
        message: 'Error recording payment: ' + (error instanceof Error ? error.message : 'Unknown error')
      });
    }
  }
}
