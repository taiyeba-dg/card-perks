import { motion } from "framer-motion";

interface Props {
  inputPanel: React.ReactNode;
  resultPanel: React.ReactNode;
}

export default function DesktopOptimizerLayout({
  inputPanel,
  resultPanel,
}: Props) {
  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      {/* Sidebar / Control Panel */}
      <motion.aside
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="sticky top-16 h-[calc(100vh-64px)] w-[400px] shrink-0 flex flex-col p-8 space-y-8 bg-[hsl(225,25%,6%)] overflow-y-auto scrollbar-hide border-r border-[hsl(43,20%,16%)]/15"
      >
        {inputPanel}
      </motion.aside>

      {/* Main Content / Results */}
      <motion.section
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="flex-1 p-12 overflow-y-auto"
      >
        <div className="max-w-5xl mx-auto space-y-12">
          {resultPanel}
        </div>
      </motion.section>
    </div>
  );
}
