import { Request, Response } from 'express';
  import { Student } from '../models/Student';
  

export class StudentController {

  
  static async list(req: Request, res: Response) {
    try {
      const className = req.query.class as string;
      const students = className 
        ? await Student.getByClass(className)
        : await Student.getAll();
      const classes = await Student.getClasses();
      
      res.render('students/list', {
        title: 'Students',
        students,
        classes,
        selectedClass: className || 'all'
      });
    } catch (error) {
      console.error('Error fetching students:', error);
      res.status(500).send('Error loading students');
    }
  }

  static showForm(req: Request, res: Response) {
    res.render('students/form', {
      title: 'Add New Student',
      student: null
    });
  }

  static async create(req: Request, res: Response) {
    const { name, class: className, rollNumber, email, phone, address, admissionDate } = req.body;
    
    try {
      await Student.create({
        name,
        class: className,
        rollNumber,
        email,
        phone,
        address,
        admissionDate
      });
      res.redirect('/students');
    } catch (error) {
      console.error('Error creating student:', error);
      res.render('students/form', {
        title: 'Add New Student',
        error: 'Failed to create student'
      });
    }
  }

  static async details(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const student = await Student.getById(id);
      
      if (!student) {
        return res.status(404).send('Student not found');
      }
      
      res.render('students/details', {
        title: `Student Details - ${student.name}`,
        student
      });
    } catch (error) {
      console.error('Error fetching student details:', error);
      res.status(500).send('Error loading student details');
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, class: className, rollNumber, email, phone, address, dob, admissionDate } = req.body;

      console.log('Updating student', id, 'payload:', req.body);

      // Validate email if provided
      if (email) {
        const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRe.test(String(email))) {
          if (req.is('application/json')) return res.status(400).json({ success: false, error: 'Invalid email address' });
          return res.status(400).send('Invalid email address');
        }
      }

      // Validate phone if provided: must be exactly 10 digits
      if (phone) {
        const digits = String(phone).replace(/\D/g, '');
        if (digits.length !== 10) {
          if (req.is('application/json')) return res.status(400).json({ success: false, error: 'Phone number must be exactly 10 digits' });
          return res.status(400).send('Phone number must be exactly 10 digits');
        }
      }

      // If rollNumber provided, ensure uniqueness (simple check for JSON/file fallback and Mongo)
      if (rollNumber) {
        try {
          const all = await Student.getAll();
          const conflict = all.find((s: any) => String(s._id) !== String(id) && s.rollNumber === rollNumber);
          if (conflict) {
            if (req.is('application/json')) return res.status(400).json({ success: false, error: 'Roll number already in use by another student' });
            return res.status(400).send('Roll number already in use by another student');
          }
        } catch (e) {
          // log and continue - uniqueness check is best-effort
          console.warn('Could not check rollNumber uniqueness:', e);
        }
      }

      const updated = await Student.update(id, {
        name,
        class: className,
        rollNumber,
        email,
        phone,
        address,
        dob,
        admissionDate
      } as any);

      if (!updated) {
        if (req.is('application/json')) return res.status(404).json({ success: false, error: 'Student not found' });
        return res.status(404).send('Student not found');
      }

      if (req.is('application/json')) {
        return res.json({ success: true, student: updated });
      }

      res.redirect(`/students/${id}`);
    } catch (error) {
      console.error('Error updating student:', error);
      const msg = (error && (error as any).message) ? (error as any).message : 'Internal server error';
      if (req.is('application/json')) return res.status(500).json({ success: false, error: msg });
      res.status(500).send('Error updating student: ' + msg);
    }
  }

  static async moveToHistory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await Student.delete(id);
      if (result) {
        res.status(200).json({ success: true });
      } else {
        res.status(404).json({ success: false, error: 'Student not found' });
      }
    } catch (error) {
      console.error('Error moving student to history:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
}
