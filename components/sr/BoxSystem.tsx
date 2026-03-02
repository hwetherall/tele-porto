'use client'

interface BoxCounts {
  1: number
  2: number
  3: number
  4: number
  5: number
  6: number
}

interface BoxSystemProps {
  counts: BoxCounts
  dueByBox: BoxCounts
  onStartReview?: () => void
}

const BOX_LABELS = ['New', '1 day', '3 days', '1 week', '2 weeks', 'Mastered']
const BOX_COLORS = [
  'bg-red-100 border-red-200 text-red-700',
  'bg-orange-100 border-orange-200 text-orange-700',
  'bg-yellow-100 border-yellow-200 text-yellow-700',
  'bg-blue-100 border-blue-200 text-blue-700',
  'bg-purple-100 border-purple-200 text-purple-700',
  'bg-porto-green-100 border-porto-green-200 text-porto-green-700',
]

const BOX_DUE_COLORS = [
  'bg-red-500',
  'bg-orange-500',
  'bg-yellow-500',
  'bg-blue-500',
  'bg-purple-500',
  'bg-porto-green-500',
]

export default function BoxSystem({ counts, dueByBox, onStartReview }: BoxSystemProps) {
  const totalCards = Object.values(counts).reduce((a, b) => a + b, 0)
  const totalDue = Object.values(dueByBox).reduce((a, b) => a + b, 0)

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-bold text-gray-900">Your Cards</h2>
          <p className="text-sm text-gray-500">{totalCards} cards across 6 boxes</p>
        </div>
        {totalDue > 0 && (
          <button
            onClick={onStartReview}
            className="btn-primary py-2 px-4 text-sm"
          >
            Review {totalDue}
          </button>
        )}
        {totalDue === 0 && totalCards > 0 && (
          <span className="text-sm text-porto-green-600 font-medium">All caught up! 🎉</span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {([1, 2, 3, 4, 5, 6] as const).map((box) => {
          const count = counts[box]
          const due = dueByBox[box]
          const colorClass = BOX_COLORS[box - 1]
          const dueColorClass = BOX_DUE_COLORS[box - 1]

          return (
            <div
              key={box}
              className={`relative flex flex-col items-center p-3 rounded-xl border-2 ${colorClass}`}
            >
              {due > 0 && (
                <span className={`absolute -top-1.5 -right-1.5 ${dueColorClass} text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center`}>
                  {due > 9 ? '9+' : due}
                </span>
              )}
              <span className="text-xs font-medium opacity-70 mb-1">Box {box}</span>
              <span className="text-2xl font-bold">{count}</span>
              <span className="text-xs opacity-60 mt-1 text-center leading-tight">{BOX_LABELS[box - 1]}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
