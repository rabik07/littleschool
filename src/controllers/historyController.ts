import { Request, Response } from 'express';
import { History } from '../models/History';

export class HistoryController {
  static async index(req: Request, res: Response) {
    try {
      const passoutStudents = await History.getPassoutStudents();
      const passoutTeachers = await History.getPassoutTeachers();
      
      res.render('history/index', {
        title: 'History',
        passoutStudents,
        passoutTeachers
      });
    } catch (error) {
      console.error('Error loading history:', error);
      res.status(500).send('Error loading history');
    }
  }
}
