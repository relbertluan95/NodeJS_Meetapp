import {
  startOfHour,
  parseISO,
  isBefore,
  subHours,
  startOfDay,
  endOfDay,
} from 'date-fns';
import { Op } from 'sequelize';

import Meetapp from '../models/Meetapp';
import User from '../models/User';
import File from '../models/File';

class MeetappController {
  async store(req, res) {
    const user_id = req.userId;
    const { date } = req.body;

    // Check for past dates
    const hourStart = startOfHour(parseISO(date));

    if (isBefore(hourStart, new Date())) {
      return res.status(400).json({ error: 'Past dates are not permitted' });
    }

    // check date availability
    const checkAvailability = await Meetapp.findOne({
      where: {
        user_id,
        date: hourStart,
      },
    });

    if (checkAvailability) {
      return res.status(400).json({ error: 'Meetapp date is not available' });
    }

    const meetapp = await Meetapp.create({
      ...req.body,
      user_id,
    });

    return res.json(meetapp);
  }

  async index(req, res) {
    const where = {};
    const page = req.query.page || 1;

    if (req.query.date) {
      const searchDate = parseISO(req.query.date);

      where.date = {
        [Op.between]: [startOfDay(searchDate), endOfDay(searchDate)],
      };
    }

    const meetups = await Meetapp.findAll({
      where,
      attributes: ['id', 'title', 'description', 'location', 'date'],
      include: [
        {
          model: User,
          as: 'organizer',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: File,
          as: 'banner',
          attributes: ['id', 'name', 'path', 'url'],
        },
      ],
      limit: 10,
      offset: 10 * page - 10,
    });

    return res.json(meetups);
  }

  async delete(req, res) {
    const meetapp = await Meetapp.findByPk(req.params.id);

    if (meetapp.user_id !== req.userId) {
      return res.status(401).json({
        error: "You don't have permission to cancel this meetapp",
      });
    }

    const dateWithSub = subHours(meetapp.date, 2);

    if (isBefore(dateWithSub, new Date())) {
      return res.status(401).json({
        error: 'You can only cancel meetapp 2 hours is advence',
      });
    }

    await meetapp.destroy();

    return res.json(meetapp);
  }

  async update(req, res) {
    const user_id = req.userId;
    const meetapp = await Meetapp.findByPk(req.params.id);
    const { date } = req.body;

    if (meetapp.user_id !== user_id) {
      return res.status(401).json({
        error: "You don't have permission to cancel this meetapp",
      });
    }

    // Check for past dates
    const hourStart = startOfHour(parseISO(date));

    if (isBefore(hourStart, new Date())) {
      return res.status(400).json({ error: 'Past dates are not permitted' });
    }

    if (isBefore(meetapp.date, new Date())) {
      return res.status(400).json({ error: "Can't update past meetups." });
    }

    await meetapp.update(req.body);

    return res.json(meetapp);
  }
}

export default new MeetappController();
