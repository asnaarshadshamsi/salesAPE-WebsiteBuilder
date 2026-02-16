import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { businessRepository } from "@/db/repositories";
import { BusinessEditForm } from "@/components/BusinessEditForm";
import { QRCodeCard } from "@/components/QRCodeCard";
import { Rocket, ArrowLeft, LogOut, ExternalLink } from "lucide-react";
import { signOut } from "@/actions/auth";

interface BusinessPageProps {
  params: Promise<{ id: string }>;
}

async function getBusiness(id: string, userId: string) {
  const business = await businessRepository.findByIdWithSite(id, userId);
  return business;
}

export default async function BusinessSettingsPage({ params }: BusinessPageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const { id } = await params;
  const business = await getBusiness(id, user.id);

  if (!business) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-zinc-950 border-b border-pink-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-linear-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center shadow-lg shadow-pink-500/25">
                <Rocket className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-linear-to-r from-pink-400 to-pink-600 bg-clip-text text-transparent">
                HackSquad
              </span>
            </Link>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-400">
                {user.name || user.email}
              </span>
              <form action={signOut}>
                <button
                  type="submit"
                  className="text-gray-400 hover:text-pink-400 p-2 rounded-lg hover:bg-zinc-800 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-gray-400 hover:text-pink-400 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>

        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">{business.name}</h1>
            <p className="text-gray-400">Manage your business settings</p>
          </div>
          {business.site && (
            <Link
              href={`/sites/${business.site.slug}`}
              target="_blank"
              className="inline-flex items-center px-4 py-2 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition-colors shadow-lg shadow-pink-500/25"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View Site
            </Link>
          )}
        </div>

        <BusinessEditForm
          business={{
            id: business.id,
            name: business.name,
            description: business.description || "",
            logo: business.logo || "",
            primaryColor: business.primaryColor,
            secondaryColor: business.secondaryColor,
            services: business.services ? JSON.parse(business.services) : [],
            phone: business.phone || "",
            email: business.email || "",
            address: business.address || "",
            city: business.city || "",
            calendlyUrl: business.calendlyUrl || "",
          }}
          siteSlug={business.site?.slug}
        />

        {/* QR Code Section */}
        {business.site && (
          <div className="mt-8">
            <QRCodeCard
              siteUrl={`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/sites/${business.site.slug}`}
              businessName={business.name}
            />
          </div>
        )}
      </main>
    </div>
  );
}
