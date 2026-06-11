import { useEffect } from 'react'

const usePageTitle = (title: string) => {
  useEffect(() => {
    const fullTitle = title === "HomeFinder Pro" ? title : `${title} | HomeFinder Pro`
    document.title = fullTitle
  }, [title])
}

export default usePageTitle
