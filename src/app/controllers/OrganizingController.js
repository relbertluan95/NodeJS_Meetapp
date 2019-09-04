import Meetapp from '../models/Meetapp';
import File from '../models/File';

class OrganizingController {
  async store(req, res) {
    const meetapp = await Meetapp.findAll({
      where: { user_id: req.userId },
      order: ['date'],
      attributes: ['id', 'title', 'description', 'location', 'date', 'past'],
      include: [
        {
          model: File,
          as: 'banner',
          attributes: ['id', 'name', 'path', 'url'],
        },
      ],
    });
    return res.json(meetapp);
  }
}

export default new OrganizingController();
