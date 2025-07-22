import { Link } from "wouter";
import { Github, Twitter, MessageCircle } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-800 border-t border-gray-700 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">The RPG Vault</h3>
            <p className="text-gray-400 text-sm mb-4">
              The ultimate community for tabletop RPG enthusiasts. Discover, review, and discuss your favorite games.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                <MessageCircle className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-4">Explore</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/browse">
                  <span className="hover:text-purple-400 transition-colors cursor-pointer">Browse RPGs</span>
                </Link>
              </li>
              <li>
                <Link href="/rankings">
                  <span className="hover:text-purple-400 transition-colors cursor-pointer">Top Rankings</span>
                </Link>
              </li>
              <li>
                <span className="hover:text-purple-400 transition-colors cursor-pointer">New Releases</span>
              </li>
              <li>
                <span className="hover:text-purple-400 transition-colors cursor-pointer">Categories</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-4">Community</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/forums">
                  <span className="hover:text-purple-400 transition-colors cursor-pointer">Forums</span>
                </Link>
              </li>
              <li>
                <span className="hover:text-purple-400 transition-colors cursor-pointer">Reviews</span>
              </li>
              <li>
                <span className="hover:text-purple-400 transition-colors cursor-pointer">User Profiles</span>
              </li>
              <li>
                <span className="hover:text-purple-400 transition-colors cursor-pointer">Guidelines</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <span className="hover:text-purple-400 transition-colors cursor-pointer">Help Center</span>
              </li>
              <li>
                <a 
                  href="mailto:rpgvaulthelp@gmail.com" 
                  className="hover:text-purple-400 transition-colors cursor-pointer"
                >
                  Contact Us
                </a>
              </li>
              <li>
                <span className="hover:text-purple-400 transition-colors cursor-pointer">Privacy Policy</span>
              </li>
              <li>
                <span className="hover:text-purple-400 transition-colors cursor-pointer">Terms of Service</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2024 The RPG Vault. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
