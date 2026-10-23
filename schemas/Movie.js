import z from 'zod'
import { MOVIE_GENRES } from '../entities/MovieGenres.js'

const movieSchema = z.object({
  title: z.string({
    invalid_type_error: 'Title must be a string',
    required_error: 'Title is required'
  }),
  year: z.number().int().positive().min(1900).max(2026),
  director: z.string(),
  duration: z.number().int().positive(),
  poster: z.url({ message: 'Poster must be a valid URL' }),
  rate: z.number().min(0).max(10),
  genres: z.array(z.enum(MOVIE_GENRES)).optional()
})

export function validateMovie (input) {
  return movieSchema.safeParse(input)
}

export function validatePartialMovie (input) {
  return movieSchema.partial().safeParse(input)
}
