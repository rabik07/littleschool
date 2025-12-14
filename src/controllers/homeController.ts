import { Request, Response } from 'express';

export class HomeController {
  static index(req: Request, res: Response) {
    res.render('home/index', {
      title: 'Home - School Management System'
    });
  }
}


