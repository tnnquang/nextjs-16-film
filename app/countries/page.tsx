import { Metadata } from 'next'
import Link from 'next/link'
import { Globe } from 'lucide-react'
import movieApiCorrected from '@/lib/api/movies-corrected'
import { APP_NAME, ROUTES } from '@/lib/constants'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: `Quốc Gia - ${APP_NAME}`,
  description: 'Khám phá phim từ các quốc gia trên thế giới',
}

export default async function CountriesPage() {
  const countries = await movieApiCorrected.getCountries()

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Quốc Gia</h1>
        <p className="text-muted-foreground">
          Khám phá phim từ {countries.length} quốc gia
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {countries.map((country) => (
          <Link
            key={country._id}
            href={ROUTES.COUNTRY_DETAIL(country.slug || country._id)}
            className="group"
          >
            <Card className="h-full transition-all duration-300 hover:shadow-lg hover:scale-105 hover:border-primary">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    {country.flagLogo ? (
                      <img 
                        src={country.flagLogo} 
                        alt={country.name}
                        className="h-5 w-8 object-cover rounded"
                      />
                    ) : (
                      <Globe className="h-5 w-5 text-primary" />
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-lg group-hover:text-primary transition-colors">
                  {country.name}
                </CardTitle>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
