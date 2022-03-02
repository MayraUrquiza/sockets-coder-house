import mongoose from 'mongoose';
import logger from '../../utils/logger.js';

class MongoDBContainer {
  constructor(model, schema) {
    this.model = mongoose.model(model, schema);
  }

  async save(entry) {
    try {
      const newDocument = new this.model(entry);
      const result = await newDocument.save();
      return result._id;
    } catch (error) {
      logger.error("ERROR:", error);
    }
  }

  async update(id, entry) {
    try {
      await this.model.updateOne({_id: id}, {$set: {...entry}});  
      return {...entry, _id: id};
    } catch (error) {
      logger.error("ERROR:", error);
    }
  }

  async getById(id) {
    try {
      return await this.model.findOne({_id: id}).lean();
    } catch (error) {
      logger.error("ERROR:", error);
    }
  }

  async getAll() {
    try {
      return await this.model.find().lean();
    } catch (error) {
      return [];
    }
  }

  async deleteById(id) {
    try {
      await this.model.deleteOne({_id: id});
    } catch (error) {
      logger.error("ERROR:", error);
    }
  }
}

export default MongoDBContainer;
