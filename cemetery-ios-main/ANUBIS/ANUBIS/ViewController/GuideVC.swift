//
//  GuideVC.swift
//  ANUBIS
//
//  Created by TecSpine on 9/16/21.
//

import UIKit

struct GuidePageModel {
    var text: String
    var imageName: String
}

class GuideVC: UIViewController {

    @IBOutlet weak var bottomView: UIView!
    @IBOutlet weak var collectionView: UICollectionView!
    @IBOutlet weak var paginationIndicator: UIPageControl!
    
    var dataModel: [GuidePageModel] = [GuidePageModel(text: "Select the State button to enter the State where the cemetery is located.", imageName: "apple1"),
                                       GuidePageModel(text: "From this screen you can either scroll through or enter the State initial in to the search box to find your State. Once you have found that State, select its initial or press done. To display all the cemeteries in our data base for that State.", imageName: "apple2"),
                                       GuidePageModel(text: "From this screen you can either scroll through and select the cemetery you are looking for or search for them. Some States have over 10,000 cemetery locations. So it better to search for the them. You can either enter the name of the cemetery in the search box or the first letter. This will show you all the names of the cemeteries beginning with that letter.", imageName: "apple3"),
                                       GuidePageModel(text: "From this screen you will see the name of the State and the name of the cemetery you have selected. To go to this location select search.", imageName: "apple4"),
                                       GuidePageModel(text: "From this screen you will see an icon with wings and a halo.", imageName: "apple5"),
                                       GuidePageModel(text: "Tap the icon. The name of the cemetery will come up. You will also see GPS Click to GO. Tap GPS Click to GO. This will take you to the cemetery location selected.", imageName: "apple6"),
                                       GuidePageModel(text: "From this screen you will see the layout of the cemetery.  Once you have the map and the location of your love one gravesite. Position the map you have so the layout of the cemetery on your phone match the map. The red icon on the map shows the coordinates of the cemetery you selected. Note* some maps are posted at the entry of the cemetery. If this is the case you may have to position your phone to the map. This may require you to temporally disable the rotation feature on your cell phone.", imageName: "apple7"),
                                       GuidePageModel(text: "Here you see the layout of the cemetery from your cell phone to the left and the cemetery map of the grave sites locations to your right. As you can see they are position to match each other. Although they are slightly different their close enough for us to find the grave site were looking for which is G-3. G-3 is located on the map at Phase II just below the road in Phase I to the right of the road in Phase II. We can see a similar road pattern of Phase I and II on the cell phone map.", imageName: "apple7-3"),
                                       GuidePageModel(text: "Now that you have found the grave site location on your phone . Press closest to the G-3 area gravesite until you see a red dot that looks like a balloon. Once your done just select start. To improve your accuracy zoom in on the location.", imageName: "apple8"),
                                       GuidePageModel(text: "From this screen select your location", imageName: "apple9"),
                                       GuidePageModel(text: "From this screen select Allow Once and you will be mapped to that location from your current position. ANUBIS will take you as close to the grave sight as the road allows. You will than be guided by foot until you reach your selected area. From their you will be able to use the cemetery markers to find their grave site. Note* cemetery makers varies from cemetery to cemetery. Some have location markers that make it easier to find your gravesite while others not so much. With the correct information ANUBIS can get you within feet of your grave site regardless of how difficult it may be. Even if there are no tombstone or marker on their gravesite.", imageName: "apple10")]
    
    
    // MARK: - IBOutlets
      @IBOutlet weak var contentView: UIView!
//      @IBOutlet weak var continueButton: UIButton!
//      @IBOutlet weak var arrowButton: UIButton!
//      @IBOutlet weak var bottomView: UIView!
//
      // MARK: - Class Properties
      var viewControllers = [UIViewController]()
      var pageController: UIPageViewController?
      var currentPageIndex = 0
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        initialSetup()
        paginationIndicator.transform = CGAffineTransform(scaleX: 1.5, y: 1.5)
        pageController?.view.frame = self.contentView.bounds
        pageController?.view.setNeedsLayout()
        pageController?.view.layoutIfNeeded()
        viewControllers.forEach { (vc) in
          vc.view.frame = self.contentView.bounds
          vc.view.setNeedsLayout()
          vc.view.layoutIfNeeded()
        }
        

    }
    
}


  




    // MARK: - Class Methods
extension GuideVC {
      fileprivate func initialSetup() {
        configurePageViewController()
      }
      func loadTurorialDataVC(model: GuidePageModel)-> GuidePageVC {
        let vc: GuidePageVC = getViewController(sbName: "Main", vcName: "GuidePageVC")
        vc.model = model
        return vc
      }
      fileprivate func configurePageViewController() {
        self.pageController = UIPageViewController(transitionStyle: .scroll, navigationOrientation: .horizontal, options: nil)
        self.pageController?.dataSource = self
        self.pageController?.delegate = self
        viewControllers = dataModel.map({loadTurorialDataVC(model: $0)})
        if let firstVC = viewControllers.first {
          pageController?.setViewControllers([firstVC], direction: .forward, animated: true, completion: nil)
            paginationIndicator.numberOfPages = viewControllers.count
          addChildViewControllerWithView(pageController!)
          // Set Button Style
          setNextButtonStyle(firstVC)
        }
      }
      func addChildViewControllerWithView(_ childViewController: UIViewController, toView view: UIView? = nil) {
        let view: UIView = view ?? self.view
        childViewController.removeFromParent()
        childViewController.willMove(toParent: self)
        addChild(childViewController)
        view.addSubview(childViewController.view)
        childViewController.didMove(toParent: self)
//        self.view.bringSubviewToFront(bottomView)
        view.setNeedsLayout()
        view.layoutIfNeeded()
      }
      fileprivate func setNextButtonStyle(_ lastPushedVC: UIViewController) {
        let done = "Done"
        let skip = "Skip"
        if lastPushedVC == viewControllers.last {
//          continueButton.isHidden = true
//          arrowButton.setTitle(done, for: .normal)
//          arrowButton.setImage(UIImage(named: ""), for: UIControl.State.normal)
        }else{
//          continueButton.isHidden = false
//          arrowButton.setTitle("”, for: .normal)
//          arrowButton.setImage(UIImage(named: "arrow-point-to-right-ic”), for: UIControl.State.normal)
        }
//        continueButton.setTitle(skip, for: .normal)
      }
      
    }
    // MARK: - IBActions
extension GuideVC {
  @IBAction func nextButtonPressed(_ sender: UIButton) {
    if paginationIndicator.currentPage == 10 {
        let storyBoard: UIStoryboard = UIStoryboard(name: "Main", bundle: nil)
        let newViewController = storyBoard.instantiateViewController(withIdentifier: "HomeVC") as! HomeVC
        self.navigationController?.pushViewController(newViewController, animated: true)
    }
    else{
        guard let currrentPage = self.pageController?.viewControllers?.first else { return }
        guard let vc = self.pageViewController(self.pageController!, viewControllerAfter: currrentPage) else { return }
        self.pageController?.setViewControllers([vc], direction: .forward, animated: true, completion: nil)
        paginationIndicator.currentPage = viewControllers.firstIndex(of: vc)!
    }
    
  
  
//    setNextButtonStyle(vc)
  }
  @IBAction func skipButtonPressed(_ sender: UIButton) {
  
    let storyBoard: UIStoryboard = UIStoryboard(name: "Main", bundle: nil)
    let newViewController = storyBoard.instantiateViewController(withIdentifier: "HomeVC") as! HomeVC
    self.navigationController?.pushViewController(newViewController, animated: true)
//    self.view .addSubview(bottomView)
//    self.view .bringSubviewToFront(bottomView)
  }

}
    // MARK: PageController Delegates
extension GuideVC: UIPageViewControllerDelegate {
  func pageViewController(_ pageViewController: UIPageViewController, didFinishAnimating finished: Bool, previousViewControllers: [UIViewController], transitionCompleted completed: Bool) {
    if let lastPushedVC = pageViewController.viewControllers?.last {
        paginationIndicator.currentPage = viewControllers.firstIndex(of: lastPushedVC)!
//      setNextButtonStyle(lastPushedVC)
    }
  }
}
    // MARK: - PageController DataSource
extension GuideVC: UIPageViewControllerDataSource {
  func pageViewController(_ pageViewController: UIPageViewController, viewControllerBefore viewController: UIViewController) -> UIViewController? {
    guard let currentIndex: Int = viewControllers.firstIndex(of: viewController) else {
      return nil
    }
    let previousIndex = currentIndex - 1
    if currentIndex == 0 {
      return nil
    }
    return viewControllers[previousIndex]
  }
  func pageViewController(_ pageViewController: UIPageViewController, viewControllerAfter viewController: UIViewController) -> UIViewController? {
    guard let currentIndex = viewControllers.firstIndex(of: viewController) else {
      return nil
    }
    let nextIndex = currentIndex + 1
    if nextIndex >= dataModel.count {
      return nil
    }
    return viewControllers[nextIndex]
  }
    func getViewController<T: UIViewController>(sbName: String, vcName: String) -> T {
        let sb = UIStoryboard(name: sbName, bundle: nil)
        let vc = sb.instantiateViewController(withIdentifier: vcName) as! T
        vc.modalTransitionStyle = UIModalTransitionStyle.crossDissolve
        return vc
      }
}


extension UIScrollView {
  func updateContentView() {
    print(subviews.sorted(by: { $0.frame.maxY < $1.frame.maxY }).last?.frame.maxY )
    print(contentSize.height)
    contentSize.height = subviews.sorted(by: { $0.frame.maxY < $1.frame.maxY }).last?.frame.maxY ?? contentSize.height
  }
}


