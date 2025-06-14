
import { useAuth } from "@/hooks/useAuth";
import { CitizenDashboard } from "@/components/dashboard/CitizenDashboard";
import { OfficialDashboard } from "@/components/dashboard/OfficialDashboard";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { AuthModal } from "@/components/auth/AuthModal";
import { TwitterFeed } from "@/components/social/TwitterFeed";
import { motion } from "framer-motion";
import { AnimatedBackground } from "@/components/ui/animated-background";
import { AnimatedText } from "@/components/ui/animated-text";

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <AnimatedBackground>
        <div className="flex items-center justify-center min-h-screen">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-3 border-blue-600 border-t-transparent rounded-full"
          />
        </div>
      </AnimatedBackground>
    );
  }

  if (!user) {
    return (
      <AnimatedBackground>
        <div className="min-h-screen flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-8 max-w-2xl mx-auto"
          >
            <div className="space-y-4">
              <AnimatedText 
                text="🏛️ CivicVoice Platform" 
                variant="gradient"
                className="text-5xl font-bold"
              />
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-xl text-gray-600 leading-relaxed"
              >
                Join the conversation that shapes your community. Share your voice, 
                connect with officials, and be part of democratic change.
              </motion.p>
            </div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 }}
            >
              <AuthModal />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12"
            >
              <div className="p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200">
                <h3 className="font-bold text-lg mb-2">🗣️ Share Your Voice</h3>
                <p className="text-gray-600">Post about community issues, share opinions, and engage in meaningful discussions</p>
              </div>
              <div className="p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200">
                <h3 className="font-bold text-lg mb-2">🏛️ Connect with Officials</h3>
                <p className="text-gray-600">Direct communication with government representatives and local authorities</p>
              </div>
              <div className="p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200">
                <h3 className="font-bold text-lg mb-2">📊 Real-time Insights</h3>
                <p className="text-gray-600">AI-powered analysis of community sentiment and trending issues</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </AnimatedBackground>
    );
  }

  // For authenticated users, show the Twitter-style feed as the main interface
  if (user.role === 'citizen') {
    return <TwitterFeed />;
  }

  if (user.role === 'government_official') {
    return <OfficialDashboard user={user} onLogout={() => window.location.reload()} />;
  }

  if (user.role === 'admin') {
    return <AdminDashboard user={user} onLogout={() => window.location.reload()} />;
  }

  return <TwitterFeed />;
};

export default Index;
