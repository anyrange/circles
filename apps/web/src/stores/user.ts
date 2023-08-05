import { defineStore } from "pinia"
import { useStorage } from "@vueuse/core"

interface User {
  id: string
  type: string
  privacy: "public" | "private"
  display_name: string
  email: string
  avatar: string
  country: string
  filter_enabled: boolean
  url: string
  product: string
  last_login: string
  registration_date: string
}

export const useUserStore = defineStore(
  "user",
  () => {
    const authToken = useCookie("authToken", {
      sameSite: true,
      httpOnly: true,
      secure: true,
    })

    const user = useStorage("circles-user", {} as User)

    const login = (token: string) => {
      authToken.value = token
    }

    const updateUser = (data: User) => {
      user.value = data
    }

    const logout = () => {
      authToken.value = ""
      user.value = null
    }

    return {
      user,
      login,
      updateUser,
      logout,
    }
  },
  {
    persist: true,
  }
)
