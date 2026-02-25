import { Link } from "wouter";
import { motion } from "framer-motion";
import { Plus, BookOpen, LayoutGrid, Clock, Calendar } from "lucide-react";
import { useFullCourses, useOneShotCourses } from "@/hooks/use-courses";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: fullCourses, isLoading: loadingFull } = useFullCourses();
  const { data: oneShotCourses, isLoading: loadingOneShot } = useOneShotCourses();

  const CourseCard = ({ course }: { course: any }) => (
    <Link href={`/course/${course.id}`}>
      <motion.div whileHover={{ y: -4 }} className="h-full">
        <Card className="h-full bg-card hover:bg-card/80 border-white/5 transition-colors cursor-pointer group flex flex-col">
          <CardHeader className="pb-4">
            <div className="flex justify-between items-start mb-2">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground">
                {course.courseType === 'FULL' ? 'Curriculum' : 'OneShot'}
              </span>
            </div>
            <CardTitle className="text-xl line-clamp-2 leading-tight group-hover:text-primary transition-colors">
              {course.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="mt-auto">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <span>{new Date(course.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  );

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map(i => (
        <Card key={i} className="bg-card border-white/5">
          <CardHeader>
            <Skeleton className="w-10 h-10 rounded-lg mb-2" />
            <Skeleton className="h-6 w-3/4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">My Learning</h1>
          <p className="text-muted-foreground mt-1">Continue your personalized curriculum.</p>
        </div>
        <Link href="/create">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-full px-6 shadow-lg shadow-primary/25">
            <Plus className="mr-2 w-5 h-5" />
            Create Course
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="full" className="w-full">
        <TabsList className="mb-8 bg-secondary/50 p-1 rounded-xl">
          <TabsTrigger value="full" className="rounded-lg px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
            <LayoutGrid className="w-4 h-4 mr-2" />
            Full Courses
          </TabsTrigger>
          <TabsTrigger value="oneshot" className="rounded-lg px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
            <Clock className="w-4 h-4 mr-2" />
            One-Shot Sessions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="full" className="mt-0">
          {loadingFull ? <LoadingSkeleton /> : (
            fullCourses?.length === 0 ? (
              <div className="text-center py-20 bg-card rounded-3xl border border-white/5">
                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium">No full courses yet</h3>
                <p className="text-muted-foreground mb-6">Upload a syllabus to generate a comprehensive curriculum.</p>
                <Link href="/create">
                  <Button variant="outline">Create your first course</Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {fullCourses?.map((course: any) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            )
          )}
        </TabsContent>

        <TabsContent value="oneshot" className="mt-0">
          {loadingOneShot ? <LoadingSkeleton /> : (
            oneShotCourses?.length === 0 ? (
              <div className="text-center py-20 bg-card rounded-3xl border border-white/5">
                <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium">No one-shot sessions</h3>
                <p className="text-muted-foreground mb-6">Create a quick, focused lesson on a specific topic.</p>
                <Link href="/create">
                  <Button variant="outline">Create a quick session</Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {oneShotCourses?.map((course: any) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            )
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
