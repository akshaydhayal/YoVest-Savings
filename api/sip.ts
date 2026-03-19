import type { VercelRequest, VercelResponse } from '@vercel/node'
import dbConnect from './lib/mongodb.js'
import Goal from './models/Goal.js'

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  const { method } = request

  try {
    await dbConnect()
  } catch (error: any) {
    console.error('Database connection failed:', error)
    return response.status(500).json({ 
      success: false, 
      error: 'Database connection failed', 
      details: error.message,
      hint: 'Check if MONGODB_URI is set in Vercel environment variables and IP Whitelist is configured.'
    })
  }

  switch (method) {
    case 'GET':
      try {
        const { userAddress } = request.query
        if (!userAddress) {
          return response.status(400).json({ success: false, error: 'User address required' })
        }
        const goals = await Goal.find({ userAddress: (userAddress as string).toLowerCase() })
        response.status(200).json({ success: true, data: goals })
      } catch (error: any) {
        response.status(400).json({ success: false, error: error.message })
      }
      break

    case 'POST':
      try {
        const { userAddress, vaultId, amount, period } = request.body
        const goal = await Goal.create({
          userAddress: userAddress.toLowerCase(),
          vaultId,
          amount,
          period,
          createdAt: Date.now(),
        })
        response.status(201).json({ success: true, data: goal })
      } catch (error: any) {
        response.status(400).json({ success: false, error: error.message })
      }
      break

    case 'DELETE':
      try {
        const { id } = request.query
        if (!id) {
          return response.status(400).json({ success: false, error: 'Goal ID required' })
        }
        await Goal.findByIdAndDelete(id)
        response.status(200).json({ success: true, data: {} })
      } catch (error: any) {
        response.status(400).json({ success: false, error: error.message })
      }
      break

    case 'PUT':
      // Option to update the createdAt for executed plans
      try {
        const { id } = request.query
        const goal = await Goal.findByIdAndUpdate(
          id,
          { createdAt: Date.now() },
          { new: true, runValidators: true }
        )
        if (!goal) {
          return response.status(400).json({ success: false })
        }
        response.status(200).json({ success: true, data: goal })
      } catch (error: any) {
        response.status(400).json({ success: false })
      }
      break

    default:
      response.setHeader('Allow', ['GET', 'POST', 'DELETE', 'PUT'])
      response.status(405).end(`Method ${method} Not Allowed`)
      break
  }
}
