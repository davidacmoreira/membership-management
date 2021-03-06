
// eslint-disable-next-line
import { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

import { SECRET } from '../config/config'
import knex from '@database/connection'

const createToken = (userId: number) => {
  const token = jwt.sign({ id: userId }, SECRET, { expiresIn: 86400 })

  return token
}

const checkPassword = async (password: string, hash: string) => {
  const compare = await bcrypt.compare(password, hash)

  return compare
}

class AuthController {
  async signin (request: Request, response: Response) {
    const user = await knex('users')
      .where('username', request.body.username)
      .select('*')
      .first()

    if (user) {
      const validPassword = await checkPassword(request.body.password, user.password)

      delete request.body.password
      delete user.password

      if (validPassword) {
        const token = createToken(Number(user.id))

        await knex('users')
          .update({ token })
          .where('id', Number(user.id))

        return response.status(200).json({ token })
      }

      return response.status(400).json({ message: 'invalid password' })
    }

    return response.status(400).json({ message: 'invalid username' })
  }
}

export default AuthController
