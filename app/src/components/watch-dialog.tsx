import React, { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { toast } from "sonner"; // Assuming you installed sonner

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar"; // From Shadcn (needs react-day-picker)
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import MoviePoster, { Movie } from "@/components/movie-poster";
import StarRating from "@/components/ui/star-rating"; // Assume standard react component
import { handleAddWatch, handleAddReview } from "@/lib/MovieService"; // <-- IMPORT SERVICE

export default function WatchDialog({
  movie,
  children,
}: {
  movie: Movie;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date>(new Date());
  const [formatType, setFormatType] = useState("home");
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
        await handleAddWatch(movie.id, formatType, date.toISOString().split("T")[0]);

        if (rating > 0) {
            await handleAddReview(movie.id, rating, review);
        }
        
        toast.success(`Logged '${movie.title}'`);
        setOpen(false);
    } catch (e: any) {
      console.error(e);
      if (e.message?.includes("must watch the movie")) {
        toast.error("Error: You must log a watch before reviewing.");
      } else {
        toast.error("Failed to log a watch.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || <Button className="w-full">Log Watch</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Log a Watch</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col md:flex-row gap-6 py-4">
          <div className="w-32 flex-shrink-0 mx-auto md:mx-0">
            <MoviePoster movie={movie} variant="minimal" size="medium" />
          </div>

          <div className="flex-1 space-y-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Date Watched</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(d) => d && setDate(d)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Format</label>
              <div className="flex gap-2">
                {["theater", "home", "mobile"].map((f) => (
                  <Button
                    key={f}
                    type="button"
                    variant={formatType === f ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFormatType(f)}
                    className="capitalize"
                  >
                    {f}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Rating & Review</label>
              <StarRating rating={rating} onRatingChange={setRating} />
              <Textarea
                placeholder="What did you think?"
                value={review}
                onChange={(e) => setReview(e.target.value)}
                className="resize-none"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : "Save Log"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
