import { Card, CardContent } from '@/components/ui/card';
import { Shield, Users, Activity, Brain } from 'lucide-react';
export function Features() {
  return <section className="bg-transparent py-16 md:py-32 relative overflow-hidden">
            <div className="mx-auto max-w-3xl lg:max-w-5xl px-6">
                <div className="relative">
                    {/* Animated Rain Background Effect */}
                    <div className="absolute inset-0 -mx-6 pointer-events-none">
                        {/* Main rain container */}
                        <div 
                            className="absolute inset-0 opacity-5"
                            style={{
                                backgroundImage: `
                                    radial-gradient(4px 100px at 0px 235px, hsl(var(--primary)), transparent),
                                    radial-gradient(4px 100px at 300px 235px, hsl(var(--primary)), transparent),
                                    radial-gradient(1.5px 1.5px at 150px 117.5px, hsl(var(--primary)) 100%, transparent 150%),
                                    radial-gradient(4px 100px at 0px 252px, hsl(var(--primary)), transparent),
                                    radial-gradient(4px 100px at 300px 252px, hsl(var(--primary)), transparent),
                                    radial-gradient(1.5px 1.5px at 150px 126px, hsl(var(--primary)) 100%, transparent 150%),
                                    radial-gradient(4px 100px at 0px 150px, hsl(var(--primary)), transparent),
                                    radial-gradient(4px 100px at 300px 150px, hsl(var(--primary)), transparent),
                                    radial-gradient(1.5px 1.5px at 150px 75px, hsl(var(--primary)) 100%, transparent 150%),
                                    radial-gradient(4px 100px at 0px 253px, hsl(var(--primary)), transparent),
                                    radial-gradient(4px 100px at 300px 253px, hsl(var(--primary)), transparent),
                                    radial-gradient(1.5px 1.5px at 150px 126.5px, hsl(var(--primary)) 100%, transparent 150%),
                                    radial-gradient(4px 100px at 0px 204px, hsl(var(--primary)), transparent),
                                    radial-gradient(4px 100px at 300px 204px, hsl(var(--primary)), transparent),
                                    radial-gradient(1.5px 1.5px at 150px 102px, hsl(var(--primary)) 100%, transparent 150%),
                                    radial-gradient(4px 100px at 0px 134px, hsl(var(--primary)), transparent),
                                    radial-gradient(4px 100px at 300px 134px, hsl(var(--primary)), transparent),
                                    radial-gradient(1.5px 1.5px at 150px 67px, hsl(var(--primary)) 100%, transparent 150%)
                                `,
                                backgroundSize: `
                                    300px 235px, 300px 235px, 300px 235px,
                                    300px 252px, 300px 252px, 300px 252px,
                                    300px 150px, 300px 150px, 300px 150px,
                                    300px 253px, 300px 253px, 300px 253px,
                                    300px 204px, 300px 204px, 300px 204px,
                                    300px 134px, 300px 134px, 300px 134px
                                `,
                                animation: 'rain-fall 60s linear infinite'
                            }}
                        />
                        {/* Edge fade mask */}
                        <div 
                            className="absolute inset-0"
                            style={{
                                background: `radial-gradient(ellipse 80% 60% at center, transparent 0%, transparent 30%, rgba(var(--background), 0.8) 70%, rgba(var(--background), 1) 100%)`
                            }}
                        />
                    </div>
                    <div className="relative z-10 grid grid-cols-6 gap-3">
                        <Card className="relative col-span-full flex overflow-hidden lg:col-span-2 bg-card/50 backdrop-blur-sm border-muted/20">
                            <CardContent className="relative m-auto size-fit pt-6">
                                <div className="relative flex h-24 w-56 items-center">
                                    <svg className="absolute inset-0 size-full" viewBox="0 0 254 104" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M112.891 97.7022C140.366 97.0802 171.004 94.6715 201.087 87.5116C210.43 85.2881 219.615 82.6412 228.284 78.2473C232.198 76.3179 235.905 73.9942 239.348 71.3124C241.85 69.2557 243.954 66.7571 245.555 63.9408C249.34 57.3235 248.281 50.5341 242.498 45.6109C239.033 42.7237 235.228 40.2703 231.169 38.3054C219.443 32.7209 207.141 28.4382 194.482 25.534C184.013 23.1927 173.358 21.7755 162.64 21.2989C161.376 21.3512 160.113 21.181 158.908 20.796C158.034 20.399 156.857 19.1682 156.962 18.4535C157.115 17.8927 157.381 17.3689 157.743 16.9139C158.104 16.4588 158.555 16.0821 159.067 15.8066C160.14 15.4683 161.274 15.3733 162.389 15.5286C179.805 15.3566 196.626 18.8373 212.998 24.462C220.978 27.2494 228.798 30.4747 236.423 34.1232C240.476 36.1159 244.202 38.7131 247.474 41.8258C254.342 48.2578 255.745 56.9397 251.841 65.4892C249.793 69.8582 246.736 73.6777 242.921 76.6327C236.224 82.0192 228.522 85.4602 220.502 88.2924C205.017 93.7847 188.964 96.9081 172.738 99.2109C153.442 101.949 133.993 103.478 114.506 103.79C91.1468 104.161 67.9334 102.97 45.1169 97.5831C36.0094 95.5616 27.2626 92.1655 19.1771 87.5116C13.839 84.5746 9.1557 80.5802 5.41318 75.7725C-0.54238 67.7259 -1.13794 59.1763 3.25594 50.2827C5.82447 45.3918 9.29572 41.0315 13.4863 37.4319C24.2989 27.5721 37.0438 20.9681 50.5431 15.7272C68.1451 8.8849 86.4883 5.1395 105.175 2.83669C129.045 0.0992292 153.151 0.134761 177.013 2.94256C197.672 5.23215 218.04 9.01724 237.588 16.3889C240.089 17.3418 242.498 18.5197 244.933 19.6446C246.627 20.4387 247.725 21.6695 246.997 23.615C246.455 25.1105 244.814 25.5605 242.63 24.5811C230.322 18.9961 217.233 16.1904 204.117 13.4376C188.761 10.3438 173.2 8.36665 157.558 7.52174C129.914 5.70776 102.154 8.06792 75.2124 14.5228C60.6177 17.8788 46.5758 23.2977 33.5102 30.6161C26.6595 34.3329 20.4123 39.0673 14.9818 44.658C12.9433 46.8071 11.1336 49.1622 9.58207 51.6855C4.87056 59.5336 5.61172 67.2494 11.9246 73.7608C15.2064 77.0494 18.8775 79.925 22.8564 82.3236C31.6176 87.7101 41.3848 90.5291 51.3902 92.5804C70.6068 96.5773 90.0219 97.7419 112.891 97.7022Z" fill="#a855f7" />
                                    </svg>
                                    <span className="mx-auto block w-fit text-5xl font-semibold text-primary">95%</span>
                                </div>
                                <h2 className="mt-6 text-center text-3xl font-semibold text-foreground">Точност</h2>
                            </CardContent>
                        </Card>
                        <Card className="relative col-span-full overflow-hidden sm:col-span-3 lg:col-span-2 bg-card/50 backdrop-blur-sm border-muted/20">
                            <CardContent className="pt-6 flex flex-col h-full">
                                <div className="relative mx-auto flex aspect-square size-32 rounded-full border before:absolute before:-inset-2 before:rounded-full before:border border-muted/20 before:border-muted/10">
                                    <Shield className="m-auto size-12 text-primary" strokeWidth={1} />
                                </div>
                                <div className="relative z-10 mt-6 space-y-2 text-center flex-1 flex flex-col justify-center">
                                    <h2 className="text-lg font-medium transition text-foreground">Сигурност по подразбиране</h2>
                                    <p className="text-muted-foreground">Вашите данни са защитени с най-високите стандарти за сигурност и поверителност.</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="relative col-span-full overflow-hidden sm:col-span-3 lg:col-span-2 bg-card/50 backdrop-blur-sm border-muted/20">
                            <CardContent className="pt-6 flex flex-col h-full">
                                <div className="flex justify-center items-center h-32">
                                    <Activity className="size-16 text-primary" strokeWidth={1} />
                                </div>
                                <div className="relative z-10 mt-6 space-y-2 text-center flex-1 flex flex-col justify-center">
                                    <h2 className="text-lg font-medium transition text-foreground">Бърза оценка</h2>
                                    <p className="text-muted-foreground">Получете резултатите от вашата оценка на тестостерона за минути.</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="relative col-span-full overflow-hidden lg:col-span-3 bg-card/50 backdrop-blur-sm border-muted/20">
                            <CardContent className="grid pt-6 sm:grid-cols-2">
                                <div className="relative z-10 flex flex-col justify-between space-y-12 lg:space-y-6">
                                    <div className="relative flex aspect-square size-12 rounded-full border before:absolute before:-inset-2 before:rounded-full before:border border-muted/20 before:border-muted/10">
                                        <Brain className="m-auto size-5 text-primary" strokeWidth={1} />
                                    </div>
                                    <div className="space-y-2">
                                        <h2 className="text-lg font-medium text-foreground transition">Научно обосновани резултати</h2>
                                        <p className="text-muted-foreground">Нашият алгоритъм се основава на клинични изследвания и медицински стандарти.</p>
                                    </div>
                                </div>
                                <div className="rounded-tl-(--radius) relative -mb-6 -mr-6 mt-6 h-fit border-l border-t border-muted/20 p-6 py-6 sm:ml-6 bg-muted/10 backdrop-blur-sm">
                                    <div className="absolute left-3 top-2 flex gap-1">
                                        <span className="block size-2 rounded-full border border-muted/20 bg-muted/20"></span>
                                        <span className="block size-2 rounded-full border border-muted/20 bg-muted/20"></span>
                                        <span className="block size-2 rounded-full border border-muted/20 bg-muted/20"></span>
                                    </div>
                                    
                                    {/* Line Graph */}
                                    <div className="mt-8 relative h-32">
                                        {/* Graph container */}
                                        <div className="h-full relative">
                                            {/* Grid lines */}
                                            <div className="absolute inset-0 flex flex-col justify-between">
                                                <div className="h-px bg-muted/20"></div>
                                                <div className="h-px bg-muted/20"></div>
                                                <div className="h-px bg-muted/20"></div>
                                                <div className="h-px bg-muted/20"></div>
                                            </div>
                                            
                                            {/* SVG Line Graph */}
                                            <svg className="w-full h-full" viewBox="0 0 200 100" preserveAspectRatio="none">
                                                <defs>
                                                    <linearGradient id="graphGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                                        <stop offset="0%" className="text-primary" stopColor="currentColor" stopOpacity="0.3" />
                                                        <stop offset="100%" className="text-primary" stopColor="currentColor" stopOpacity="0" />
                                                    </linearGradient>
                                                </defs>
                                                
                                                {/* Area fill */}
                                                <path d="M0,85 C20,80 40,75 60,65 C80,55 100,50 120,45 C140,35 160,30 180,20 L200,15 L200,100 L0,100 Z" fill="url(#graphGradient)" style={{
                        animation: 'fade-in 2s ease-out 0.5s both'
                      }} />
                                                
                                                {/* Main line */}
                                                <path d="M0,85 C20,80 40,75 60,65 C80,55 100,50 120,45 C140,35 160,30 180,20 L200,15" stroke="hsl(var(--primary))" strokeWidth="2" fill="none" className="animate-fade-in" style={{
                        strokeDasharray: '300',
                        strokeDashoffset: '300',
                        animation: 'fade-in 2s ease-out both, scale-in 1.5s ease-out both',
                        animationDelay: '0.3s'
                      }} />
                                                
                                                {/* Data points */}
                                                <circle cx="0" cy="85" r="2" fill="hsl(var(--primary))" style={{
                        animation: 'fade-in 0.5s ease-out 1s both'
                      }} />
                                                <circle cx="60" cy="65" r="2" fill="hsl(var(--primary))" style={{
                        animation: 'fade-in 0.5s ease-out 1.2s both'
                      }} />
                                                <circle cx="120" cy="45" r="2" fill="hsl(var(--primary))" style={{
                        animation: 'fade-in 0.5s ease-out 1.4s both'
                      }} />
                                                <circle cx="180" cy="20" r="2" fill="hsl(var(--primary))" style={{
                        animation: 'fade-in 0.5s ease-out 1.6s both'
                      }} />
                                                <circle cx="200" cy="15" r="2" fill="hsl(var(--primary))" style={{
                        animation: 'fade-in 0.5s ease-out 1.8s both'
                      }} />
                                            </svg>
                                            
                                            {/* X-axis labels */}
                                            
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="relative col-span-full overflow-hidden lg:col-span-3 bg-card/50 backdrop-blur-sm border-muted/20">
                            <CardContent className="grid h-full pt-6 sm:grid-cols-2">
                                <div className="relative z-10 flex flex-col justify-between space-y-12 lg:space-y-6">
                                    <div className="relative flex aspect-square size-12 rounded-full border before:absolute before:-inset-2 before:rounded-full before:border border-muted/20 before:border-muted/10">
                                        <Users className="m-auto size-6 text-primary" strokeWidth={1} />
                                    </div>
                                    <div className="space-y-2">
                                        <h2 className="text-lg font-medium transition text-foreground">Подкрепа от експерти</h2>
                                        <p className="text-muted-foreground">Разработено от медицински специалисти в областта на хормоналното здраве.</p>
                                    </div>
                                </div>
                                <div className="before:bg-muted/20 relative mt-6 before:absolute before:inset-0 before:mx-auto before:w-px sm:-my-6 sm:-mr-6">
                                    <div className="relative flex h-full flex-col justify-center space-y-6 py-6">
                                        <div className="relative flex w-[calc(50%+0.875rem)] items-center justify-end gap-2">
                                            <span className="block h-fit rounded border border-muted/20 px-2 py-1 text-xs shadow-sm bg-muted/10 text-muted-foreground">Д-р Петров</span>
                                            <div className="ring-background size-7 ring-4">
                                                <div className="size-full rounded-full bg-primary/20 flex items-center justify-center">
                                                    <Users className="size-4 text-primary" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="relative ml-[calc(50%-1rem)] flex items-center gap-2">
                                            <div className="ring-background size-8 ring-4">
                                                <div className="size-full rounded-full bg-primary/20 flex items-center justify-center">
                                                    <Users className="size-4 text-primary" />
                                                </div>
                                            </div>
                                            <span className="block h-fit rounded border border-muted/20 px-2 py-1 text-xs shadow-sm bg-muted/10 text-muted-foreground">Д-р Николова</span>
                                        </div>
                                        <div className="relative flex w-[calc(50%+0.875rem)] items-center justify-end gap-2">
                                            <span className="block h-fit rounded border border-muted/20 px-2 py-1 text-xs shadow-sm bg-muted/10 text-muted-foreground">Д-р Стоянов</span>
                                            <div className="ring-background size-7 ring-4">
                                                <div className="size-full rounded-full bg-primary/20 flex items-center justify-center">
                                                    <Users className="size-4 text-primary" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </section>;
}