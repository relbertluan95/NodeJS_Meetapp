import Meetapp from '../models/Meetapp';
import File from '../models/File';
import User from '../models/User';

class OrganizingController {
  async index(req, res) {
    const meetapp = await Meetapp.findOne({
      where: { id: req.params.id },
      // attributes: ['id', 'title', 'description', 'location', 'date'],
      include: [
        {
          model: User,
          as: 'organizer',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: File,
          as: 'banner',
          attributes: ['url', 'path', 'name'],
        },
      ],
    });

    if (meetapp.user_id !== req.userId) {
      return res
        .status(400)
        .json({ error: 'You cannot access a Meetapp that is not yours' });
    }
    return res.json(meetapp);
  }

  async store(req, res) {
    const meetapp = await Meetapp.findAll({
      where: { user_id: req.userId },
      order: ['date'],
      attributes: ['id', 'title', 'description', 'location', 'date', 'past'],
    });
    return res.json(meetapp);
  }
}

export default new OrganizingController();
