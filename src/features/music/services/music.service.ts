const baseUrl = process.env.NEXT_PUBLIC_API_ENDPOINT

const MusicService = {
  async getItems(query: string) {
    try {
      const response = await fetch(
        `${baseUrl}/musics?query=${encodeURIComponent(query)}`,
        {
          method: 'GET',
        }
      )

      return await response.json()
    } catch (error) {
      console.error('Failed to fetch music items:', error)
      throw error
    }
  },
}

export default MusicService
