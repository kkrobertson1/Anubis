package com.ab.cemeteryapplication.onBoarding

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.speech.tts.TextToSpeech
import android.speech.tts.TextToSpeech.OnInitListener
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.viewpager.widget.PagerAdapter
import androidx.viewpager.widget.ViewPager
import com.tbuonomo.viewpagerdotsindicator.DotsIndicator
import com.ab.cemeteryapplication.R
import com.ab.cemeteryapplication.Utils.Prefs
import com.ab.cemeteryapplication.activities.MainActivity
import java.util.*

class OnBoardingActivity : AppCompatActivity(), OnInitListener {
    companion object {

        fun showOnBoard(): Boolean {
            return Prefs.getBoolean("ShowOnBoard", true)
        }

        fun setShowOnBoard(value: Boolean) {
            Prefs.putBoolean("ShowOnBoard", value)
        }

        fun start(context: Context, intent: Intent) {
            context.startActivity(intent.apply {
                setClass(
                    context,
                    OnBoardingActivity::class.java
                )
            })
        }
    }

    private var textToSpeech: TextToSpeech? = null


    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_on_boarding)

        findViewById<ViewPager>(R.id.viewPager).offscreenPageLimit = 9
        findViewById<ViewPager>(R.id.viewPager).adapter = Adapter(this)
        findViewById<DotsIndicator>(R.id.dotsIndicator).setViewPager(findViewById<ViewPager>(R.id.viewPager))
        findViewById<ViewPager>(R.id.viewPager).addOnPageChangeListener(object : ViewPager.OnPageChangeListener {
            override fun onPageScrolled(
                position: Int,
                positionOffset: Float,
                positionOffsetPixels: Int
            ) {

            }

            override fun onPageSelected(position: Int) {
                val layout = (findViewById<ViewPager>(R.id.viewPager).adapter as Adapter).views[position]
                var description = layout.findViewById<TextView>(R.id.title)
                when (position) {
                    0 -> {
                        description.setText("Select the State button to enter the State were the cemetery is located.")
                        textToSpeech!!.speak(
                            description.getText().toString(),
                            TextToSpeech.QUEUE_FLUSH, null, "onTouchTextToSpeech"
                        )
                    }
                    1 -> {
                        description.setText("From this screen you can either scroll through or enter the State initial in to the search box to find your State. Once you have found that State, select its initial. To display all the cemeteries in our data base for that State.")
                        textToSpeech!!.speak(
                            description.getText().toString(),
                            TextToSpeech.QUEUE_FLUSH, null, "onTouchTextToSpeech"
                        )
                    }
                    2 -> {
                        description.setText("From this screen you can either scroll through and select the cemetery your looking for or search for them. Some States have over 10,000 cemetery locations. So it better to search for them. You can either enter the name of the cemetery in the search box or the first letter. This will show you all the names of the cemeteries beginning with that letter.")
                        textToSpeech!!.speak(
                            description.getText().toString(),
                            TextToSpeech.QUEUE_FLUSH, null, "onTouchTextToSpeech"
                        )
                    }
                    3 -> {
                        description.setText("From this screen you will see the name of the State and the name of the cemetery you have selected. To go to this location select search.")
                        textToSpeech!!.speak(
                            description.getText().toString(),
                            TextToSpeech.QUEUE_FLUSH, null, "onTouchTextToSpeech"
                        )
                    }
                    4 -> {
                        description.setText("From this screen you will see an icon with wings and a halo.")
                        textToSpeech!!.speak(
                            description.getText().toString(),
                            TextToSpeech.QUEUE_FLUSH, null, "onTouchTextToSpeech"
                        )
                    }
                    5 -> {
                        description.setText("Tap the icon. The name of the cemetery will come up. You will also see GPS Click to GO. Tap GPS Click to GO. This will take you to the cemetery location selected.")
                        textToSpeech!!.speak(
                            description.getText().toString(),
                            TextToSpeech.QUEUE_FLUSH, null, "onTouchTextToSpeech"
                        )
                    }
                    6 -> {
                        description.setText("From this screen you will see the layout of the cemetery.  Once you have the map and the location of your love one gravesite. Position the map you have so the layout of the cemetery on your phone match the map. The blue dot on the map shows your current location at the cemetery. Note* some maps are posted at the entry of the cemetery. If this is the case you may have to position your phone to the map. This may require you to temporally disable the rotation feature on your cell phone.")
                        textToSpeech!!.speak(
                            description.getText().toString(),
                            TextToSpeech.QUEUE_FLUSH, null, "onTouchTextToSpeech"
                        )
                    }
                    7 -> {
                        description.setText("Here you see the layout of the cemetery from the cell phone to the left and the cemetery map of the gravesites locations to your right. As you can see they are position to match each other. Although they are slightly different their close enough for us to find the gravesite we are looking for which is G-23. G-23 is located on the map at Phase II just to the left of the water pond. We can see the same water pond on the cell phone map.")
                        textToSpeech!!.speak(
                            description.getText().toString(),
                            TextToSpeech.QUEUE_FLUSH, null, "onTouchTextToSpeech"
                        )
                    }
                    8 -> {
                        description.setText("Now that you have found the gravesite location on your phone . It is best to zoom in on the location to improve your accuracy. Once you have zoomed in on that area. Press closest to the G-23 area gravesite until you see a red dot that looks like a balloon. Once you are done just select start and you will be mapped to that location from your current position. ANUBIS will take you as close to the gravesite as the road allows. You will than be guided by foot until you reach your selected area. From their you will be able to use the cemetery markers to find their gravesite. Note* cemetery makers varies from cemetery to cemetery. Some have location markers that make it easier to find your gravesite while others not so much. With the correct information ANUBIS can get you within feet of your grave site regardless of how difficult it may be. Even when there are no tombstone or marker on their gravesite.")
                        textToSpeech!!.speak(
                            description.getText().toString(),
                            TextToSpeech.QUEUE_FLUSH, null, "onTouchTextToSpeech"
                        )
                    }
                }
                if (position < 8) {
                    findViewById<TextView>(R.id.nextButton).text = ""
                    findViewById<TextView>(R.id.nextButton).setCompoundDrawablesWithIntrinsicBounds(
                        ContextCompat.getDrawable(
                            this@OnBoardingActivity,
                            R.drawable.ic_arrow_small
                        ), null, null, null
                    )
                } else {
                    findViewById<TextView>(R.id.nextButton).text = "DONE"
                    findViewById<TextView>(R.id.nextButton).setCompoundDrawables(null, null, null, null)
                }
            }

            override fun onPageScrollStateChanged(state: Int) {

            }

        })

        findViewById<TextView>(R.id.skipButton).setOnClickListener {
            findViewById<ViewPager>(R.id.viewPager).setCurrentItem(9, true)
        }

        findViewById<TextView>(R.id.nextButton).setOnClickListener {
            val currentItem = findViewById<ViewPager>(R.id.viewPager).currentItem
            if (currentItem < 8) findViewById<ViewPager>(R.id.viewPager).setCurrentItem(currentItem + 1, true)
            else {
                setShowOnBoard(false)
                startActivity(Intent(this, MainActivity::class.java))
                finish()
                textToSpeech!!.stop()
            }
        }

        textToSpeech = TextToSpeech(this, this)
        textToSpeech!!.setLanguage(Locale.ENGLISH)


    }

    class Adapter(activity: AppCompatActivity) :
        PagerAdapter() {

        val views = arrayOf(
            View.inflate(activity, R.layout.onboard_screen1, null),
            View.inflate(activity, R.layout.onboard_screen2, null),
            View.inflate(activity, R.layout.onboard_screen3, null),
            View.inflate(activity, R.layout.onboard_screen4, null),
            View.inflate(activity, R.layout.onboard_screen5, null),
            View.inflate(activity, R.layout.onboard_screen6, null),
            View.inflate(activity, R.layout.onboard_screen7, null),
            View.inflate(activity, R.layout.onboard_screen8, null),
            View.inflate(activity, R.layout.onboard_screen9, null)
        )

        override fun getPageTitle(position: Int): CharSequence? {
            return ""
        }

        override fun instantiateItem(container: ViewGroup, position: Int): Any {
            val view = views[position].also {
                if (it.parent != null) {
                    (it.parent as ViewGroup).removeAllViews()
                }
            }
            container.addView(view)
            return view
        }

        override fun isViewFromObject(view: View, other: Any): Boolean {
            return view == other
        }

        override fun getCount(): Int {
            return 9
        }

    }

    override fun onInit(status: Int) {
        if (textToSpeech != null) {
            var description =
                (findViewById<ViewPager>(R.id.viewPager).adapter as Adapter).views[0].findViewById<TextView>(R.id.title)
            textToSpeech!!.speak(
                description.getText().toString(),
                TextToSpeech.QUEUE_FLUSH, null, "onTouchTextToSpeech"
            )
        }
    }
}